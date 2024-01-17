export const name = Discord.Events.MessageCreate;
export const once = false;


import Discord from "discord.js";
import { emojis } from "@magicalbunny31/awesome-utility-stuff";

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


   // this message's content doesn't include "flooded area"
   if (!message.content.toLowerCase().includes(`flooded area`))
      return;


   // react to the message
   await message.react(emojis.flooded_area);
};