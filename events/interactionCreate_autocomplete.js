export const name = `interactionCreate`;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Interaction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // this file is for AutocompleteInteractions
   if (interaction.type !== Discord.InteractionType.ApplicationCommandAutocomplete)
      return;


   // get this autocomplete interaction's command's name
   const commandName = interaction.commandName
      .split(`_`)
      .join(`_`);


   // get this select menu's file
   const file = await import(`../interactions/autocomplete/${commandName}.js`);


   // run the select menu
   return await file.default(interaction, redis);
};