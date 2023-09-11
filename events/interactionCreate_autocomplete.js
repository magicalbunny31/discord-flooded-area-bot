export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";
import { noop } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Interaction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // this file is for AutocompleteInteractions
   if (!interaction.isAutocomplete())
      return;


   // fennec-utilities
   const isBlacklisted = interaction.client.blacklist?.includes(interaction.user.id);

   const developers = JSON.parse(process.env.DEVELOPERS.replaceAll(`'`, `"`));
   const isDeveloper = developers.includes(interaction.user.id);


   // this user is in the global blacklist
   if (isBlacklisted)
      return;


   // maintenance
   if (await interaction.client.fennec.getStatus() === `maintenance` && !isDeveloper)
      return;


   // get this file
   const name = [
      interaction.commandName,
      interaction.options.getSubcommandGroup(false),
      interaction.options.getSubcommand(false)
   ]
      .filter(Boolean)
      .join(` `);

   const file = interaction.client.interactions.autocomplete.get(name);


   // this file isn't for this guild
   if (!file.guilds.includes(interaction.guild.id))
      return;


   try {
      // run the file
      await file.default(interaction, firestore);

   } catch (error) {
      // an error occurred
      try {
         await interaction.client.fennec.sendError(error, Math.floor(interaction.createdTimestamp / 1000), interaction);

      } catch {
         noop;

      } finally {
         console.error(error.stack);
      };
   };
};