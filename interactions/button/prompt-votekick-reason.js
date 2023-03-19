import Discord from "discord.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, id, valueId ] = interaction.customId.split(`:`);


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`votekick-reason:${id}`)
      .setTitle(`💬 Why were you votekicked?`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`reason`)
                  .setLabel(`REASON`)
                  .setPlaceholder(`📝 Input the reason...`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMaxLength(500)
                  .setRequired(true)
            )
      );

   if (valueId) {
      const { value } = (await firestore.collection(`temporary-stuff`).doc(valueId).get()).data() || {};
      modal.components[0].components[0].setValue(value);
   };


   // show the modal
   return await interaction.showModal(modal);
};