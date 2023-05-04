export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Interaction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // this file is for AutocompleteInteractions
   if (!interaction.isAutocomplete())
      return;


   // this user is in the global blacklist
   if (interaction.client.blacklist.includes(interaction.user.id))
      return;


   // maintenance
   if (await interaction.client.fennec.getStatus() === `maintenance`)
      if (!JSON.parse(process.env.DEVELOPERS.replaceAll(`'`, `"`)).includes(interaction.user.id))
         return;


   // get this command's file
   const file = await import(`../interactions/autocomplete/${interaction.commandName}.js`);


   try {
      // run the file
      await file.default(interaction, firestore);

   } catch (error) {
      // an error occurred
      try {
         return await interaction.client.fennec.sendError(error, Math.floor(interaction.createdTimestamp / 1000), interaction);

      } finally {
         return console.error(error.stack);
      };
   };
};