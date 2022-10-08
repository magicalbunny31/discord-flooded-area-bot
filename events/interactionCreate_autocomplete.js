export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";
import { sendBotError } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Interaction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // this file is for AutocompleteInteractions
   if (!interaction.isAutocomplete())
      return;


   // get this command's file
   const file = await import(`../interactions/autocomplete/${interaction.commandName}.js`);


   try {
      // run the autocomplete for this file
      return await file.default(interaction, firestore);


   } catch (error) {
      // an error occurred
      return await sendBotError(
         interaction,
         {
            url: process.env.WEBHOOK_ERRORS
         },
         error
      );
   };
};