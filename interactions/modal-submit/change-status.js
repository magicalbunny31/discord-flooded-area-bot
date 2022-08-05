import Discord from "discord.js";
import { set, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * change a suggestion's status
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // modal info
   const [ _modal ] = interaction.customId.split(`:`);


   // fields
   const status = interaction.fields.getTextInputValue(`status`); // select menu
   const reason = interaction.fields.getTextInputValue(`reason`);


   // TODO temp while status is text input
   if (![ `approved`, `denied`, `open for discussion` ].includes(status))
      return await interaction.reply({
         content: `error: **status \`${status}\`** not of type \`approved\` | \`denied\` | \`open for discussion\``,
         ephemeral: true
      });


   // what type of suggestion this suggestion is exactly
   const channelTypes = Object.fromEntries(Object.entries(await redis.HGETALL(`flooded-area:channel:suggestions`)).map(id => id.reverse()));
   const type = channelTypes[interaction.channel.parent.id];


   // get this suggestion
   const suggestionMessage = await interaction.channel.fetchStarterMessage();
   const suggestion = await redis.HGETALL(`flooded-area:${type}:${suggestionMessage.id}`);


   // new settings embed
   const toHuman = array => array.concat(array.splice(-2, 2).join(` and `)).join(`, `);

   const edits = JSON.parse(suggestion.edits);
   const editors = set(edits.map(edit => Discord.userMention(edit.editor)));
   const lastEdit = edits.at(-1);

   const settingsEmbed = new Discord.EmbedBuilder(interaction.message.embeds[0].data)
      .setDescription(strip`
         **${
            status === `open for discussion`
               ? `💬`
               : status === `approved`
                  ? `✅`
                  : `❎`
         } Status**
         ${
            [ `approved`, `denied` ].includes(status)
               ? strip`
                  > ${status === `approved` ? `Approved` : `Denied`} by ${Discord.userMention(interaction.user.id)} ${Discord.time(Math.floor(interaction.createdTimestamp / 1000), Discord.TimestampStyles.RelativeTime)}.
                  > \`${reason}\`
               `
               : `> Open for discussion since ${Discord.time(Math.floor(interaction.createdTimestamp / 1000), Discord.TimestampStyles.RelativeTime)}.`
         }

         **✏️ Editors**
         ${
            edits.length
               ? strip`
                  > Edited by ${toHuman(editors)}.
                  > Last edited by ${Discord.userMention(lastEdit.editor)} ${Discord.time(Math.floor(lastEdit[`created-timestamp`] / 1000), Discord.TimestampStyles.RelativeTime)}
               `
               : `> **\`No edits to list.\`**`
         }
      `);


   // update the interaction
   await interaction.update({
      embeds: [
         settingsEmbed
      ]
   });


   // set the new status in the database
   await redis.HSET(`flooded-area:${type}:${suggestionMessage.id}`, {
      "last-updated-timestamp": JSON.stringify(interaction.createdTimestamp),

      "status": status,
      ...status !== `open for discussion`
         ? {
            "status-changer": interaction.user.id,
            "status-reason": reason
         }
         : {}
   });

   if (status === `open for discussion`)
      await redis.HDEL(`flooded-area:${type}:${suggestionMessage.id}`, [ `status-changer`, `status-reason` ]);


   // follow-up with some info on what to do next
   if ([ `approved`, `denied` ].includes(status))
      await interaction.followUp({
         content: strip`
            **${status === `approved` ? `✅ Approved` : `❎ Denied`} this suggestion!**
            ${
               // status === `approved`
                  /*?*/ `> Consider deleting this suggestion to reduce clutter in ${interaction.channel.parent}.` // TODO auto-deleting suggestions
                  // : `> This suggestion will be auto-deleted ${Discord.time(Math.floor((interaction.createdTimestamp + 8.64e+7) / 1000), Discord.TimestampStyles.RelativeTime)}.`
            }
         `,
         ephemeral: true
      });


   // find a colour based on the votes
   const cumulativeVotes = +suggestion.upvotes - +suggestion.downvotes;

   const colour = (() => {
      const positiveColours = [ 0xfaee00, 0xedef00, 0xd8ef04, 0xc0ee16, 0xa5ee26, 0x88ec35, 0x6deb41, 0x57e949, 0x4de94c ];
      const neutralColour   =   0xffee00;
      const negativeColours = [ 0xffe800, 0xffd800, 0xffc100, 0xffa400, 0xff8400, 0xff6300, 0xfc4100, 0xf81e00, 0xf60000 ];

      return cumulativeVotes === 0
         ? neutralColour
         : cumulativeVotes > 0
            ? positiveColours[         cumulativeVotes ] || positiveColours[8]
            : negativeColours[Math.abs(cumulativeVotes)] || negativeColours[8];
   })();


   // new suggestion embed
   const suggestionEmbed = new Discord.EmbedBuilder(suggestionMessage.embeds[0].data)
      .setColor(
         [ `approved`, `denied` ].includes(status)
            ? status === `approved` ? 0x4de94c : 0xf60000
            : colour
      )
      .setFooter({
         text: [
            ...cumulativeVotes >= 10
               ? [ `🎉` ] : [],
            ...[ `approved`, `denied` ].includes(status)
               ? [ status === `approved` ? `✅` : `❎` ] : [],
            ...suggestion.locked === `true`
               ? [ `🔒` ] : []
         ]
            .join(``)
         || null
      });


   // update the suggestion message
   await suggestionMessage.edit({
      embeds: [
         suggestionEmbed
      ]
   });
};