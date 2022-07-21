export const name = `messageCreate`;
export const once = false;


import Discord from "discord.js";
import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Message} message
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (message, redis) => {
   // don't listen to partials
   if (message.partial)
      return;


   // id of user to listen to (in this case: magicalbunny31)
   const listenToId = `490178047325110282`;


   // don't listen to this message if this isn't magicalbunny31
   if (message.author.id !== listenToId)
      return;


   // this message has to first start mentioning the bot
   const [ prefix, command, ...args ] = message.content?.split(` `);

   if (!new RegExp(`^<@!?${message.client.user.id}>$`).test(prefix))
      return;


   // no message commands >w>
};