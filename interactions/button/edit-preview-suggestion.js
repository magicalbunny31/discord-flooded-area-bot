import Discord from "discord.js";

/**
 * edit the user's suggestion before sending
 * @param {Discord.ButtonInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // button info
   const [ _button, type, id ] = interaction.customId.split(`:`);


   // get values to fill in in the modal
   const { suggestionOrPartName, imageOrPartDescriptionOrNull, partImageOrNull } = await redis.HGETALL(`flooded-area:suggestion-values:${id}`);


   // send the correct modal for each suggestion type
   switch (type) {


      /**
       * suggestions for flooded area on roblox
       */
      case `game-suggestions`: {
         // show modal
         return await interaction.showModal(
            new Discord.ModalBuilder()
               .setCustomId(`suggestions:${type}`)
               .setTitle(`Game Suggestions`)
               .setComponents([
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`suggestion`)
                           .setLabel(`YOUR SUGGESTION`)
                           .setPlaceholder(`🎮 What is your suggestion for the game?`)
                           .setValue(suggestionOrPartName)
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
                           .setValue(imageOrPartDescriptionOrNull)
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
               .setCustomId(`suggestions:server-suggestions`)
               .setTitle(`Server Suggestions`)
               .setComponents([
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`suggestion`)
                           .setLabel(`YOUR SUGGESTION`)
                           .setPlaceholder(`💬 What is your suggestion for the server?`)
                           .setValue(suggestionOrPartName)
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
                           .setValue(imageOrPartDescriptionOrNull)
                           .setRequired(false)
                           .setStyle(Discord.TextInputStyle.Short)
                     ])
               ])
         );
      };


      /**
       * suggestions for a new part for flooded are on roblox
       */
      case `part-suggestions`: {
         // show modal
         return await interaction.showModal(
            new Discord.ModalBuilder()
               .setCustomId(`suggestions:part-suggestions`)
               .setTitle(`Part Suggestions`)
               .setComponents([
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`name`)
                           .setMaxLength(1024)
                           .setLabel(`PART NAME`)
                           .setPlaceholder(`🏷️ What is this part's name?`)
                           .setValue(suggestionOrPartName)
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
                           .setValue(imageOrPartDescriptionOrNull)
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
                           .setValue(partImageOrNull)
                           .setRequired(false)
                           .setStyle(Discord.TextInputStyle.Short)
                     ])
               ])
         );
      };


   };
};