export const name = "suggest-new-bot-feature";
export const guilds = [ process.env.GUILD_SPACED_OUT ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`suggest-new-bot-feature`)
   .setDescription(`Suggest a new bot feature for this server`);


import Discord from "discord.js";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`suggest-new-bot-feature`)
      .setTitle(`🗃️ Suggest a new bot feature`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`feature`)
                  .setLabel(`FEATURE`)
                  .setPlaceholder(`What's your suggestion?`)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setRequired(true)
            )
      );


   // show the modal
   await interaction.showModal(modal);
};