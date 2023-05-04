export const name = Discord.Events.MessageCreate;
export const once = false;


import Discord from "discord.js";

import pkg from "../package.json" assert { type: "json" };

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


   // 8ball
   if (message.content.startsWith(`<@${message.client.user.id}> 8ball`)) {
      await message.channel.sendTyping();

      const response = await fetch(`https://eightballapi.com/api`, {
         headers: {
            "Accept": `application/json`,
            "User-Agent": `${pkg.name}/${pkg.version} (https://github.com/${pkg.author}/${pkg.name})`
         }
      });

      if (!response.ok)
         return;

      const { reading } = await response.json();
      return await message.reply({
         content: `🎱 \`${reading}\``,
         allowedMentions: {
            repliedUser: false
         }
      });
   };


   // "@Area Communities Bot 🌊"
   if (message.content === `<@${message.client.user.id}>`)
      return await message.reply({
         content: `what`,
         allowedMentions: {
            repliedUser: false
         }
      });


   // "is <insert thing here> a cutie"
   if (/is .* a cutie/.test(message.content)) // <-- best feature yet (~a cutie)
      return await message.reply({
         content: choice([ `yes`, `no` ]),
         allowedMentions: {
            repliedUser: false
         }
      });
};