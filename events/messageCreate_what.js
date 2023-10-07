export const name = Discord.Events.MessageCreate;
export const once = false;


import Discord from "discord.js";

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


   // this message doesn't mention the bot
   if (!new RegExp(`^<@!?${message.client.user.id}>$`).test(message.content))
      return;


   // this message has attachments
   if (message.attachments.size)
      return;


   // send typing to the channel
   await message.channel.sendTyping();


   // reply to the message
   await message.reply({
      content: `what`,
      allowedMentions: {
         repliedUser: false
      }
   });
};