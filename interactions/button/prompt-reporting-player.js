import Discord from "discord.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, id, value ] = interaction.customId.split(`:`);


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`reporting-player:${id}`)
      .setTitle(`👤 What is your Roblox account?`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`reporting-player`)
                  .setLabel(`PLAYER`)
                  .setPlaceholder(`📝 Input your username...`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMinLength(3)
                  .setMaxLength(20)
                  .setRequired(true)
            )
      );

   if (value)
      modal.components[0].components[0].setValue(value);


   // show the modal
   return await interaction.showModal(modal);
};