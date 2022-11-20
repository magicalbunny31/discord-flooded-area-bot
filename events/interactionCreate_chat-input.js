export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Interaction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // this file is for ChatInputCommandInteractions
   if (!interaction.isChatInputCommand())
      return;


   // get this command's file
   const file = await import(`../interactions/chat-input/${interaction.commandName}.js`);


   try {
      // run the command for this file
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