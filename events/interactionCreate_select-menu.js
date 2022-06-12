export const name = `interactionCreate`;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Interaction} interaction
 */
export default async interaction => {
   // this file is for SelectMenuInteractions
   if (!interaction.isSelectMenu())
      return;


   // this user is banned from making suggestions
   const suggestionsBannedRoleId = `979489114153963560`;
   const reactionMemberIsSuggestionsBanned = interaction.member.roles.cache.has(suggestionsBannedRoleId);

   if (reactionMemberIsSuggestionsBanned)
      return await interaction.reply({
         content: `You are banned from making suggestions.`,
         ephemeral: true
      });


   // get the type of suggestion
   const [ type ] = interaction.values;


   // send the correct modal for each suggestion type
   switch (type) {


      case `game`:
         return await interaction.showModal(
            new Discord.ModalBuilder()
               .setCustomId(`suggestion:game`)
               .setTitle(`Game Suggestion`)
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


      case `server`:
         return await interaction.showModal(
            new Discord.ModalBuilder()
               .setCustomId(`suggestion:server`)
               .setTitle(`Server Suggestion`)
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


      case `part`:
         return await interaction.showModal(
            new Discord.ModalBuilder()
               .setCustomId(`suggestion:part`)
               .setTitle(`Part Suggestion`)
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