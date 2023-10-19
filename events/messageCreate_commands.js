export const name = Discord.Events.MessageCreate;
export const once = false;


import Discord from "discord.js";
import { emojis, choice } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Message} message
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (message, firestore) => {
   // constants
   const embedColour = 0x4c6468;


   // ignore messages from bots/webhooks
   if (message.author.bot || message.webhookId)
      return;


   // member doesn't have the role needed to use commands
   if (!message.member.roles.cache.has(process.env.ROLE))
      return;


   // regular expression to match if this message has a prefix for the bot
   const prefixRegexp = new RegExp(`^(<@!?${message.client.user.id}>|;)\\s*`);


   // this isn't a potential command
   const commandContent = message.content.toLowerCase();

   if (!prefixRegexp.test(commandContent))
      return;


   // command information
   const [ _, matchedPrefix ] = commandContent.match(prefixRegexp);
   const [ commandName, ...args ] = message.content.slice(matchedPrefix.length).trim().split(/ +/);


   // commands
   switch (commandName) {


      // help
      case `help`: {
         return await message.reply({
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.StringSelectMenuBuilder()
                        .setCustomId(`help`)
                        .setPlaceholder(`🦊 select an option..`)
                        .setOptions(
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(`slash commands`)
                              .setValue(`chat-input`)
                              .setEmoji(emojis.slash_command),
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(`text-based commands`)
                              .setValue(`text-based`)
                              .setEmoji(emojis.active_threads)
                        )
                  )
            ],
            allowedMentions: {
               repliedUser: false
            }
         });
      };


      // uhm uh uhh
      default: {
         if (`${commandName} ${args.join(` `)}` === `do you like flooded area`)
            return await message.reply({
               content: choice([
                  `i hate flooded area`,
                  `no i HATE flooded area`,
                  `floody area 64 bad!!`,
                  `i hate this community`,
                  `why am i here`,
                  `what am i doing here`,
                  `this place sucks`
               ]),
               allowedMentions: {
                  repliedUser: false
               }
            });

         if (`${commandName} ${args.join(` `)}` === `do you love me`)
            return await message.reply({
               content: choice([
                  `no`,
                  `LMAO no`,
                  `funny joke`,
                  `of course not`,
                  `nah`,
                  `nuh uh`,
                  `who would say yes`,
                  `NO`,
                  `no way`,
                  `since when`
               ]),
               allowedMentions: {
                  repliedUser: false
               }
            });

         if (`${commandName} ${args.join(` `)}` === `donuts or cookies`)
            return await message.reply({
               content: choice([
                  `donuts`,
                  `donuts on top`,
                  `i LOVE donuts`,
                  `who doesn't love a donut?`
                  `cookies`,
                  `cookies better`,
                  `i like cookies`,
                  `a good cookie hits the spot`,
                  `idk`
               ]),
               allowedMentions: {
                  repliedUser: false
               }
            });
      };


   };
};