export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Interaction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // this file is for SelectMenuInteractions
   if (!interaction.isSelectMenu())
      return;


   // select menu info
   const [ selectMenu ] = interaction.customId.split(`:`);


   // get this select menu's file
   const file = await import(`../interactions/select-menu/${selectMenu}.js`);


   // run the select menu
   return await file.default(interaction, firestore);
};