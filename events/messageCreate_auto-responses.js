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


   // ignore bots
   if (message.author.bot)
      return;


   // ignore messages from members with manage messages permissions
   if (message.member.permissions.has(Discord.PermissionFlagsBits.ManageMessages))
      return;


   // get auto-responses
   const database = firestore.collection(`command`).doc(`auto-responses`);
   const autoResponses = Object.values((await database.get()).data());


   // loop through each auto-response
   for (const autoResponse of autoResponses) {
      // this message's content contains doesn't contain any of the phrases
      if (!autoResponse[`message-content-contains`].some(phrase => message.content.includes(phrase)))
         continue;


      // reply to the message, with the reply-with field and stop here
      return await message.reply({
         content: autoResponse[`reply-with`]
      });
   };
};