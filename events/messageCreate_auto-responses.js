export const name = Discord.Events.MessageCreate;
export const once = false;


import Discord from "discord.js";
import { choice } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Message} message
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (message, firestore) => {
   // ignore messages from bots/webhooks
   if (message.author.bot || message.webhookId)
      return;


   // ignore messages not from flooded area community
   if (message.guild?.id !== process.env.GUILD_FLOODED_AREA)
      return;


   // "@Area Communities Bot 🌊"
   if (message.content.includes(`<@983126054619189370>`))
      await message.reply({
         content: `what`,
         allowedMentions: {
            repliedUser: false
         }
      });


   // "is <insert thing here> a cutie"
   else if (/is .* a cutie/.test(message.content)) // <-- best feature yet (~a cutie)
      await message.reply({
         content: choice([ `yes`, `no` ]),
         allowedMentions: {
            repliedUser: false
         }
      });
};