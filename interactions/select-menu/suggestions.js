import Discord from "discord.js";
import { strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * show a modal to the user for them to submit a suggestion
 * @param {Discord.SelectMenuInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // select menu info
   const [ type ] = interaction.values;


   // this member is banned from making suggestions
   const [ suggestionsBanned, moderationTeam ] = await redis.MGET([ `flooded-area:role:suggestions-banned`, `flooded-area:role:moderation-team` ]);
   const memberIsSuggestionsBanned = interaction.member.roles.cache.has(suggestionsBanned);

   if (memberIsSuggestionsBanned)
      return await interaction.reply({
         content: strip`
            You are currently blacklisted from participating in suggestions.
            Please contact a member of the ${Discord.roleMention(moderationTeam)} for further assistance.
         `,
         allowedMentions: {
            parse: []
         },
         ephemeral: true
      });


   // send the correct modal for each suggestion type
   switch (type) {


      /**
       * suggestions for flooded area on roblox
       */
      case `game-suggestions`: {
         // show modal
         return await interaction.showModal(
            new Discord.ModalBuilder()
               .setCustomId(`suggestions:game-suggestions:true`)
               .setTitle(`Game Suggestions`)
               .setComponents([
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`suggestion`)
                           .setLabel(`YOUR SUGGESTION`)
                           .setPlaceholder(`🎮 What is your suggestion for the game?`)
                           .setRequired(true)
                           .setStyle(Discord.TextInputStyle.Paragraph)
                     ]),
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`image`)
                           .setMaxLength(2048)
                           .setLabel(`IMAGE`)
                           .setPlaceholder(`🔗 Add an optional image url to show.`)
                           .setRequired(false)
                           .setStyle(Discord.TextInputStyle.Short)
                     ])
               ])
         );
      };


      /**
       * suggestions for the flooded are community discord server
       */
      case `server-suggestions`: {
         // show modal
         return await interaction.showModal(
            new Discord.ModalBuilder()
               .setCustomId(`suggestions:server-suggestions:true`)
               .setTitle(`Server Suggestions`)
               .setComponents([
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`suggestion`)
                           .setLabel(`YOUR SUGGESTION`)
                           .setPlaceholder(`💬 What is your suggestion for the server?`)
                           .setRequired(true)
                           .setStyle(Discord.TextInputStyle.Paragraph)
                     ]),
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`image`)
                           .setMaxLength(2048)
                           .setLabel(`IMAGE`)
                           .setPlaceholder(`🔗 Add an optional image url to show.`)
                           .setRequired(false)
                           .setStyle(Discord.TextInputStyle.Short)
                     ])
               ])
         );
      };


      /**
       * suggestions for a new part for flooded area on roblox
       */
      case `part-suggestions`: {
         // show modal
         return await interaction.showModal(
            new Discord.ModalBuilder()
               .setCustomId(`suggestions:part-suggestions:true`)
               .setTitle(`Part Suggestions`)
               .setComponents([
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`name`)
                           .setMaxLength(1024)
                           .setLabel(`PART NAME`)
                           .setPlaceholder(`🏷️ What is this part's name?`)
                           .setRequired(true)
                           .setStyle(Discord.TextInputStyle.Short)
                     ]),
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`description`)
                           .setMaxLength(1024)
                           .setLabel(`PART DESCRIPTION`)
                           .setPlaceholder(`📰 Describe what this part does.`)
                           .setRequired(true)
                           .setStyle(Discord.TextInputStyle.Paragraph)
                     ]),
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`image`)
                           .setMaxLength(2048)
                           .setLabel(`IMAGE`)
                           .setPlaceholder(`🔗 Add an optional image url to show.`)
                           .setRequired(false)
                           .setStyle(Discord.TextInputStyle.Short)
                     ])
               ])
         );
      };


   };
};