export const name = Discord.Events.MessageCreate;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Message} message
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (message, firestore) => {
   // don't listen to partials
   if (message.partial)
      return;


   // todo: auto-responses
};