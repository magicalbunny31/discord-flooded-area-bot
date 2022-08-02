export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Interaction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // this file is for ButtonInteractions
   if (!interaction.isButton())
      return;


   // button info
   const [ button ] = interaction.customId.split(`:`);


   // get this button's file
   const file = await import(`../interactions/button/${button}.js`);


   // run the button
   return await file.default(interaction, redis);
};