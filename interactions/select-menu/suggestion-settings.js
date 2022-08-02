import Discord from "discord.js";
import { strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * suggestion settings
 * @param {Discord.SelectMenuInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // select menu info
   const [ _selectMenu, id ] = interaction.customId.split(`:`);
   const [ value ] = interaction.values;


   // what type of suggestion this suggestion is exactly
   const channelTypes = Object.fromEntries(Object.entries(await redis.HGETALL(`flooded-area:channel:suggestions`)).map(id => id.reverse()));
   const type = channelTypes[interaction.channel.parent.id];


   // values
   const [ moderationTeam, magicalbunny31 ] = await redis.MGET([ `flooded-area:role:moderation-team`, `flooded-area:user:magicalbunny31` ]);
   const suggestion = await redis.HGETALL(`flooded-area:${type}:${id}`);


   // do the thing what this value does
   switch (value) {


      case `change-status`: {
         // only staff can do this
         if (!interaction.member.roles.cache.has(moderationTeam))
            return await interaction.reply({
               content: `Only a member of the ${Discord.roleMention(moderationTeam)} can change a suggestion's status.`,
               ephemeral: true
            });

         // show modal
         return await interaction.showModal(
            new Discord.ModalBuilder()
               .setCustomId(`change-status`)
               .setTitle(`Change Status`)
               .setComponents([
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`status`)
                           .setLabel(`STATUS`)
                           .setPlaceholder(`Select a status...`)
                           .setValue(`approved | denied | open for discussion`)
                           .setRequired(true)
                           .setStyle(Discord.TextInputStyle.Short)
                     ]),
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`reason`)
                           .setMaxLength(100)
                           .setLabel(`REASON`)
                           .setPlaceholder(`📋 Why are you changing this suggestion's status?`)
                           .setRequired(true)
                           .setStyle(Discord.TextInputStyle.Short)
                     ])
               ])
         );
      };


      case `lock-suggestion`: {
         // only staff can do this
         if (!interaction.member.roles.cache.has(moderationTeam))
            return await interaction.reply({
               content: `Only a member of the ${Discord.roleMention(moderationTeam)} can lock or unlock a suggestion.`,
               ephemeral: true
            });

         // change the suggestion's locked status
         await redis.HSET(`flooded-area:${type}:${id}`, {
            "last-updated-timestamp": interaction.createdTimestamp,
            "locked": JSON.stringify(true)
         });

         // defer the interaction's update
         await interaction.deferUpdate();

         // lock this thread
         await interaction.channel.setLocked(true);
         await interaction.channel.setArchived(true);

         // suggestion embed
         const suggestionMessage = await interaction.channel.fetchStarterMessage();
         const suggestionEmbed = new Discord.EmbedBuilder(suggestionMessage.embeds[0].data)
            .setFooter({
               text: [
                  ...+suggestion.upvotes - +suggestion.downvotes >= 10
                     ? [ `🎉` ] : [],
                  ...[ `approved`, `denied` ].includes(suggestion.status)
                     ? [ suggestion.status === `approved` ? `✅` : `❎` ] : [],
                  `🔒`
               ]
                  .join(``)
               || null
            });

         // update the suggestion message
         return await suggestionMessage.edit({
            embeds: [
               suggestionEmbed
            ]
         });
      };


      case `delete-suggestion`: {
         // only staff / the suggestion author can do this
         if (!(interaction.member.roles.cache.has(moderationTeam) || interaction.user.id === suggestion.suggester))
            return await interaction.reply({
               content: `Only a member of the ${Discord.roleMention(moderationTeam)} or the suggestion author ${Discord.userMention(suggestionAuthor)} can delete a suggestion.`,
               ephemeral: true
            });

         // reply to the interaction
         return await interaction.reply({
            content: strip`
               💣 **Are you sure you want to delete this suggestion?**
               > The suggestion will still be saved internally to prevent future duplicates.
               > To permanently delete this suggestion, message ${Discord.userMention(magicalbunny31)} with the id \`${id}\`.
            `,
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents([
                     new Discord.ButtonBuilder()
                        .setCustomId(`delete-suggestion:${id}`)
                        .setLabel(`Delete Suggestion`)
                        .setEmoji(`💣`)
                        .setStyle(Discord.ButtonStyle.Danger)
                  ])
            ],
            allowedMentions: {
               parse: []
            },
            ephemeral: true
         });
      };


   };
};