export const data = new Discord.SlashCommandBuilder()
   .setName(`report-bug`)
   .setDescription(`🐛 report a bug with this command! you'll be able to input details in the modal~`);

export const guildOnly = true;


import Discord from "discord.js";
import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // TODO
   return await interaction.reply({
      content: `this command is a work in progress! check back later~`,
      ephemeral: true
   });


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`report-bug`)
      .setTitle(`🐛 report a bug`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`t`)
                  .setLabel(`DESCRIPTION`)
                  .setPlaceholder(`📋 describe what this bug does and how it affects the game`)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setRequired(true)
            ),

         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`b`)
                  .setLabel(`STEPS TO REPRODUCE`)
                  .setPlaceholder(`📝 list each action to make this bug happen; they must be reproducible 100% of the time`)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setRequired(true)
            ),

         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`c`)
                  .setLabel(`EXPECTED RESULT`)
                  .setPlaceholder(`💭 what should happen if the bug wasn't there?`)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setRequired(true)
            ),

         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`a`)
                  .setLabel(`ACTUAL RESULT`)
                  .setPlaceholder(`🗯️ what actually happens if you follow the steps to reproduce this bug`)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setRequired(true)
            )
      );


   // show the modal
   return await interaction.showModal(modal);
};