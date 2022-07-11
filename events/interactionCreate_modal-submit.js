export const name = `interactionCreate`;
export const once = false;


import Discord from "discord.js";

import pkg from "../package.json" assert { type: "json" };

import { noop } from "@magicalbunny31/awesome-utility-stuff";

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


   // modal doesn't exist locally
   if (!file)
      return;


   // run the modal
   return await file.default(interaction, redis);
};