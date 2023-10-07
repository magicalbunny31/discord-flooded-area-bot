export const name = Discord.Events.MessageCreate;
export const once = false;


import Discord from "discord.js";
import { emojis, strip, wait } from "@magicalbunny31/awesome-utility-stuff";

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


   // regular expression to match if this message has a prefix for the bot
   const prefixRegexp = new RegExp(`^(<@!?${message.client.user.id}>|;)\\s*`);


   // this isn't a potential command
   const commandContent = message.content.toLowerCase();

   if (!prefixRegexp.test(commandContent))
      return;


   // command information
   const [ _, matchedPrefix ] = commandContent.match(prefixRegexp);
   const [ commandName, ...args ] = message.content.slice(matchedPrefix.length).trim().split(/ +/);


   // this is a command
   const isCommand = [ `617`, `8ball`, `ball`, `balls`, `baller`, `boop`, `flip`, `pancake`, `pancakes`, `rate`, `roll` ].includes(commandName);

   if (isCommand) {
      const alert = await message.reply({
         content: strip`
            ### ❌ Commands have been replaced with ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`cmd`, `1160259589435048046`)}
            > - Use ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`cmd`, `1160259589435048046`)} \`help\` for a full list of commands.
         `,
         allowedMentions: {
            repliedUser: false
         }
      });

      await wait(5000);

      await alert.delete();
      return await message.delete();
   };
};