export const name = `interactionCreate`;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Interaction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // this file is for SelectMenuInteractions
   if (!interaction.isSelectMenu())
      return;


   // select menu info
   const [ selectMenu ] = interaction.customId.split(`:`);


   // get this select menu's file
   const file = await import(`../interactions/select-menu/${selectMenu}.js`);


   // select menu doesn't exist locally
   if (!file)
      return;


   // run the select menu
   return await file.default(interaction, redis);
};