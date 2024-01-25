export const name = Discord.Events.MessageCreate;
export const once = false;


import Discord from "discord.js";
import { emojis, choice } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Message} message
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (message, firestore) => {
   // ignore messages from bots/webhooks
   if (message.author.bot || message.webhookId)
      return;


   // this message isn't from these guilds
   if (![ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ].includes(message.guild?.id))
      return;


   // this message's content includes "flooded area"
   if (message.content.toLowerCase().includes(`flooded area`))
      await message.react(emojis.flooded_area);


   // this message's content includes "617" or "6/17"
   if ([ `617`, `6/17` ].some(content => message.content.includes(content)))
      await message.react(choice([ `<:617old:1119577426037575721>`, `<:617:1119576849752793129>`, `<:617__:1197298104282665040>` ]));
};