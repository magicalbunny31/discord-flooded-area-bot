export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";
import { sendBotError } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Interaction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // this file is for AutocompleteInteractions
   if (interaction.type !== Discord.InteractionType.ApplicationCommandAutocomplete)
      return;


   // get this autocomplete interaction's command's name
   const commandName = [
      interaction.commandName,
      interaction.options.getSubcommandGroup(false),
      interaction.options.getSubcommand(false)
   ]
      .filter(Boolean)
      .join(`_`);


   // get this autocomplete's file
   const file = await import(`../interactions/autocomplete/${commandName}.js`);


   // run the autocomplete interaction
   try {
      return await file.default(interaction, redis);


   } catch (error) {
      // autocomplete interactions are a bit finicky, so catch whatever error is caught here
      return await sendBotError(
         interaction,
         {
            url: process.env.WEBHOOK_ERRORS
         },
         error
      );
   };
};