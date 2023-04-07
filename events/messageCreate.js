export const name = Discord.Events.MessageCreate;
export const once = false;


import Discord from "discord.js";
import fs from "fs/promises";

/**
 * handles all messages sent to a channel that the bot can see
 * @param {Discord.Message} message
 */
export default async message => {
   // ignore bots and webhooks
   if (message.author.bot || message.webhookId)
      return;


   // member doesn't have the role needed to use commands
   if (!message.member.roles.cache.has(process.env.ROLE))
      return;


   // regular expression to match if this message has a prefix for the bot
   const prefixRegexp = new RegExp(`^(<@!?${message.client.user.id}>|;)\\s*`);


   // this isn't a command
   const commandContent = message.content.toLowerCase();

   if (!prefixRegexp.test(commandContent))
      return;


   // command information
   const [ _, matchedPrefix ] = commandContent.match(prefixRegexp);
   const [ commandName, ...args ] = message.content.slice(matchedPrefix.length).trim().split(/ +/);


   // get this command's file
   const file = await (async () => {
      const commands = await fs.readdir(`./commands/text-based`);
      for (const command of commands) {

         const file = await import(`../commands/text-based/${command}`);
         if (file.names.includes(commandName))
            return file;
      };
   })();


   // this isn't a command
   if (!file)
      return;


   try {
      // send a typing indicator to the channel
      await message.channel.sendTyping();

      // run the command for this file
      return await file.default(message, commandName, args);

   } catch (error) {
      // log this error
      console.error(error);

      // try and edit the message
      const payload = {
         content: `❌ **An error occurred.**`,
         embeds: [],
         components: [],
         files: [],
         allowedMentions: {
            repliedUser: false
         }
      };

      try {
         // find the message sent by this bot user that replies to this message
         const sentMessage = (await message.channel.messages.fetch())
            .find(m => m.author.id === message.client.user.id && m.reference?.messageId === message.id);

         // send the initial reply to this command
         if (!sentMessage)
            return await message.reply(payload);

         // edit this initial reply to the command
         else
            return await sentMessage.edit(payload);

      } catch {
         // stop here
         return;
      };
   };
};