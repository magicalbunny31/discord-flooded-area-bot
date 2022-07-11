export const name = `interactionCreate`;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Interaction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // this file is for ChatInputCommandInteractions
   if (!interaction.isChatInputCommand())
      return;


   // get this command's full name
   const commandName = [
      interaction.commandName,
      interaction.options.getSubcommandGroup(false),
      interaction.options.getSubcommand(false)
   ]
      .filter(Boolean)
      .join(`_`);


   // get this command's file
   const file = await import(`../interactions/chat-input/${commandName}.js`);


   // command doesn't exist locally
   if (!file)
      return;


   // run the command
   return await file.default(interaction, redis);
};