import Discord from "discord.js";

/**
 * @param {Discord.AnySelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu ] = interaction.customId.split(`:`);
   const mentions = interaction.values;


   // defer the interaction's update
   await interaction.deferUpdate();


   // set these strings in the database
   try {
      await firestore.collection(`ticket-settings`).doc(interaction.user.id).update({
         mentions
      });

   } catch {
      await firestore.collection(`ticket-settings`).doc(interaction.user.id).set({
         mentions
      });
   };
};