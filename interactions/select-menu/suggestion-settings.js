import Discord from "discord.js";
import { strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * edit the user's suggestion before sending
 * @param {Discord.SelectMenuInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // select menu info
   const [ _selectMenu, id ] = interaction.customId.split(`:`);
   const [ value ] = interaction.values;

   const channelTypes = Object.fromEntries(Object.entries(await redis.HGETALL(`flooded-area:channels:suggestions`)).map(id => id.reverse()));
   const type = channelTypes[interaction.channel.parent.id];


   // do the thing what this value does
   switch (value) {


      case `approve-suggestion`:
      case `deny-suggestion`:
      case `open-suggestion-for-discussion`: {
         // only staff / magicalbunny31 can do this
         const moderationTeam = `989125486590451732`;
         const magicalbunny31 = `490178047325110282`;

         if (!(interaction.member.roles.cache.has(moderationTeam) || interaction.user.id === magicalbunny31))
            return await interaction.reply({
               content: `Only a member of the ${Discord.roleMention(moderationTeam)} can change a suggestion's status.`,
               ephemeral: true
            });

         // change the suggestion's status
         await redis.HSET(`flooded-area:${type}:${id}`, {
            "status": value === `approve-suggestion`
               ? `approved`
               : value === `deny-suggestion`
                  ? `denied`
                  : `open for discussion`,
            "last-updated-timestamp": interaction.createdTimestamp
         });

         // break out
         break;
      };


      case `lock-suggestion`:
      case `unlock-suggestion`: {
         // only staff / magicalbunny31 can do this
         const moderationTeam = `989125486590451732`;
         const magicalbunny31 = `490178047325110282`;

         if (!(interaction.member.roles.cache.has(moderationTeam) || interaction.user.id === magicalbunny31))
            return await interaction.reply({
               content: `Only a member of the ${Discord.roleMention(moderationTeam)} can lock or unlock a suggestion.`,
               ephemeral: true
            });


         // change the suggestion's locked status
         await redis.HSET(`flooded-area:${type}:${id}`, {
            "locked": JSON.stringify(value === `lock-suggestion`),
            "last-updated-timestamp": interaction.createdTimestamp
         });

         // break out
         break;
      };


      case `delete-suggestion`: {
         // only staff / magicalbunny31 / the suggestion author can do this
         const moderationTeam = `989125486590451732`;
         const magicalbunny31 = `490178047325110282`;
         const suggestionAuthor = await redis.HGET(`flooded-area:${type}:${id}`, `suggester`);

         if (!(interaction.member.roles.cache.has(moderationTeam) || [ magicalbunny31, suggestionAuthor ].includes(interaction.user.id)))
            return await interaction.reply({
               content: `Only a member of the ${Discord.roleMention(moderationTeam)} or the suggestion author ${Discord.userMention(suggestionAuthor)} can delete a suggestion.`,
               ephemeral: true
            });


         // defer the update to the interaction
         await interaction.deferUpdate();

         // change the suggestion's deleted status
         await redis.HSET(`flooded-area:${type}:${id}`, {
            "deleted": JSON.stringify(true),
            "message-url": ``,
            "last-updated-timestamp": interaction.createdTimestamp
         });

         // delete the suggestion
         const suggestionMessage = await interaction.channel.fetchStarterMessage();
         await suggestionMessage.delete();

         // delete this thread (safe)
         if (interaction.channel.isThread())
            await interaction.channel.delete();

         // stop here
         return;
      };


   };


   // get this suggestion
   const suggestion = await redis.HGETALL(`flooded-area:${type}:${id}`);


   // update the settings embed
   await interaction.update({
      embeds: [
         new Discord.EmbedBuilder(interaction.message.embeds[0].data)
            .setDescription(strip`
               **${
                  suggestion.status === `open for discussion`
                     ? `🎫`
                     : suggestion.status === `approved`
                        ? `✅`
                        : `❎`
               } Status**
               > ${
                  suggestion.status === `open for discussion`
                     ? `Open for discussion since ${Discord.time(Math.floor(+suggestion[`last-updated-timestamp`] / 1000), Discord.TimestampStyles.RelativeTime)}.`
                     : `${value === `approve-suggestion` ? `Approved` : `Denied`} by ${interaction.user} ${Discord.time(Math.floor(interaction.createdTimestamp / 1000), Discord.TimestampStyles.RelativeTime)}`
               }

               **📝 Edits**
               ${
                  JSON.parse(suggestion.edits || `[]`)
                     .map(edit => `> ${Discord.hyperlink(`Edit`, edit[`message-url`], `${edit[`message-url`]} 🔗`)} from ${Discord.time(Math.floor(edit[`edit-timestamp`] / 1000), Discord.TimestampStyles.RelativeTime)} by ${Discord.userMention(edit[`editor`])}`)
                     .join(`\n`)
                  || `> No edits to list.`
               }
            `)
      ],
      components: [
         new Discord.ActionRowBuilder()
            .setComponents([
               new Discord.ButtonBuilder()
                  .setCustomId(`edit-suggestion:${id}`)
                  .setLabel(`Edit Suggestion`)
                  .setEmoji(`📝`)
                  .setStyle(Discord.ButtonStyle.Secondary)
                  .setDisabled(suggestion.locked === `true`)
            ]),
         new Discord.ActionRowBuilder()
            .setComponents([
               new Discord.SelectMenuBuilder()
                  .setCustomId(`suggestion-settings:${id}`)
                  .setPlaceholder(`🔧 Suggestion Settings...`)
                  .setOptions([
                     ...suggestion.status === `open for discussion`
                        ? [
                           new Discord.SelectMenuOptionBuilder()
                              .setLabel(`Approve Suggestion`)
                              .setDescription(`Set this suggestion's status as approved.`)
                              .setValue(`approve-suggestion`)
                              .setEmoji(`✅`),
                           new Discord.SelectMenuOptionBuilder()
                              .setLabel(`Deny Suggestion`)
                              .setDescription(`Set this suggestion's status as denied.`)
                              .setValue(`deny-suggestion`)
                              .setEmoji(`❎`)
                        ]
                        : suggestion.status === `approved`
                           ? [
                              new Discord.SelectMenuOptionBuilder()
                                 .setLabel(`Open Suggestion for Discussion`)
                                 .setDescription(`Set this suggestion's status to open for discussion.`)
                                 .setValue(`open-suggestion-for-discussion`)
                                 .setEmoji(`🎫`),
                              new Discord.SelectMenuOptionBuilder()
                                 .setLabel(`Deny Suggestion`)
                                 .setDescription(`Set this suggestion's status as denied.`)
                                 .setValue(`deny-suggestion`)
                                 .setEmoji(`❎`)
                           ]
                           : [
                              new Discord.SelectMenuOptionBuilder()
                                 .setLabel(`Approve Suggestion`)
                                 .setDescription(`Set this suggestion's status as approved.`)
                                 .setValue(`approve-suggestion`)
                                 .setEmoji(`✅`),
                              new Discord.SelectMenuOptionBuilder()
                                 .setLabel(`Open Suggestion for Discussion`)
                                 .setDescription(`Set this suggestion's status to open for discussion.`)
                                 .setValue(`open-suggestion-for-discussion`)
                                 .setEmoji(`🎫`)
                           ],
                     new Discord.SelectMenuOptionBuilder()
                        .setLabel(suggestion.locked === `false` ? `Lock Suggestion` : `Unlock Suggestion`)
                        .setDescription(suggestion.locked === `false` ? `Lock this suggestion's votes.` : `Open this suggestion's votes.`)
                        .setValue(suggestion.locked === `false` ? `lock-suggestion` : `unlock-suggestion`)
                        .setEmoji(suggestion.locked === `false` ? `🔒` : `🔓`),
                     new Discord.SelectMenuOptionBuilder()
                        .setLabel(`Delete Suggestion`)
                        .setDescription(`Removes this suggestion and deletes this thread.`)
                        .setValue(`delete-suggestion`)
                        .setEmoji(`🗑️`)
                  ])
            ])
      ]
   });


   // lock the thread
   await interaction.channel.setLocked(value === `lock-suggestion`);


   // edit the suggestion embed
   const suggestionMessage = await interaction.channel.fetchStarterMessage();

   const colour = (() => {
      const cumulativeVotes = +suggestion.upvotes - +suggestion.downvotes;

      const positiveColours = [ 0xfaee00, 0xedef00, 0xd8ef04, 0xc0ee16, 0xa5ee26, 0x88ec35, 0x6deb41, 0x57e949, 0x4de94c ];
      const neutralColour   =   0xffee00;
      const negativeColours = [ 0xffe800, 0xffd800, 0xffc100, 0xffa400, 0xff8400, 0xff6300, 0xfc4100, 0xf81e00, 0xf60000 ];

      return cumulativeVotes === 0
         ? neutralColour
         : cumulativeVotes > 0
            ? positiveColours[         cumulativeVotes ] || positiveColours[8]
            : negativeColours[Math.abs(cumulativeVotes)] || negativeColours[8];
   })();

   await suggestionMessage.edit({
      embeds: [
         new Discord.EmbedBuilder(suggestionMessage.embeds[0].data)
            .setColor(
               [ `approved`, `denied` ].includes(suggestion.status)
                  ? suggestion.status === `approved` ? 0x4de94c : 0xf60000
                  : colour
            )
            .setFooter({
               text: [
                  ...[ `approved`, `denied` ].includes(suggestion.status)
                     ? [ `${suggestion.status.toUpperCase()} ${suggestion.status === `approved` ? `✅` : `❎`}` ] : [],
                  ...+suggestion.upvotes - +suggestion.downvotes >= 10
                     ? [ `POPULAR! 🎉` ] : [],
                  ...suggestion.locked === `true`
                     ? [ `VOTES LOCKED 🔒` ] : []
               ]
                  .join(`\n`)
               || null
            })
      ]
   });
};