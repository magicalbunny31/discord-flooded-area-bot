export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Interaction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // this file is for ButtonInteractions
   if (!interaction.isButton())
      return;


   // button info
   const [ button ] = interaction.customId.split(`:`);


   // get this button's file
   const file = await import(`../interactions/button/${button}.js`);


   // run the button
   return await file.default(interaction, firestore);
};