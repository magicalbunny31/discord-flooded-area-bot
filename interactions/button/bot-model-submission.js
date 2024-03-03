export const name = "bot-model-submission";
export const guilds = [ process.env.GUILD_DARKNESS_OBBY ];

import Discord from "discord.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button ] = interaction.customId.split(`:`);


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`bot-model-submission`)
      .setTitle(`Submit level`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`model`)
                  .setLabel(`MODEL`)
                  .setPlaceholder(`input the model's link or asset id here..`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setRequired(true)
            )
      );


   // show the modal
   await interaction.showModal(modal);
};