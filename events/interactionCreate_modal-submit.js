export const name = `interactionCreate`;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Interaction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // this file is for ModalSubmitInteractions
   if (interaction.type !== Discord.InteractionType.ModalSubmit)
      return;


   // modal info
   const [ modal ] = interaction.customId.split(`:`);


   // get this modal's file
   const file = await import(`../interactions/modal-submit/${modal}.js`);


   // run the modal
   return await file.default(interaction, redis);
};