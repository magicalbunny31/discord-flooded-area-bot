export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";
import { emojis } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Interaction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // this file is for ModalSubmitInteractions
   if (!interaction.isModalSubmit())
      return;


   // modal info
   const [ modal ] = interaction.customId.split(`:`);


   // get this modal's file
   const file = await import(`../interactions/modal-submit/${modal}.js`);


   // run the modal
   return await file.default(interaction, firestore);
};