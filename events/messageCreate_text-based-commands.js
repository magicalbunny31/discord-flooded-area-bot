export const name = Discord.Events.MessageCreate;
export const once = false;


import Discord from "discord.js";
import dayjs from "dayjs";
import fs from "fs/promises";
import { FieldValue, Timestamp } from "@google-cloud/firestore";
import { choice, number, wait } from "@magicalbunny31/awesome-utility-stuff";

import pkg from "../package.json" assert { type: "json" };

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


   // this isn't a command
   const isCommand = [ ``, `617`, `8ball`, `ball`, `balls`, `baller`, `boop`, `flip`, `pancake`, `pancakes`, `rate`, `roll` ].includes(commandName);

   if (!isCommand)
      return;


   // flooded area: can only use commands in bot commands by non-staff, excluding threads
   if (message.guild.id === process.env.GUILD_FLOODED_AREA && message.channel.id !== process.env.FA_CHANNEL_BOT_COMMANDS && !message.member.roles.cache.has(process.env.FA_ROLE_MODERATION_TEAM) && !message.channel.isThread()) {
      const alert = await message.reply({
         content: `### ❌ Commands can only be used in ${Discord.channelMention(process.env.FA_CHANNEL_BOT_COMMANDS)} or in threads.`,
         allowedMentions: {
            repliedUser: false
         }
      });

      await wait(5000);

      await alert.delete();
      return await message.delete();
   };


   // TODO no pancakes in benji's house
   if (message.channel.id === `1124551551730585771` && [ `pancake`, `pancakes` ].includes(commandName))
      return;


   // commands
   switch (commandName) {


      // @Area Communities Bot 🌊🌌
      case ``: {
         return await message.reply({
            content: `what`,
            allowedMentions: {
               repliedUser: false
            }
         });
      };


      // 617
      case `617`: {
         const sixSeventeenThisYear = dayjs.utc().startOf(`year`)               .add(6, `months`).add(16, `days`).add(12, `hours`).unix();
         const sixSeventeenNextYear = dayjs.utc().startOf(`year`).add(1, `year`).add(6, `months`).add(16, `days`).add(12, `hours`).unix();

         const sixSeventeen = sixSeventeenThisYear < dayjs.utc().unix()
            ? sixSeventeenThisYear
            : sixSeventeenNextYear;

         return await message.reply({
            content: `<:617:1119576849752793129> the next 6/17 is ${Discord.time(sixSeventeen, Discord.TimestampStyles.RelativeTime)}`,
            allowedMentions: {
               repliedUser: false
            }
         });
      };


      // 8ball
      case `8ball`: {
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
            content: `🎱 "${reading}"`,
            allowedMentions: {
               repliedUser: false
            }
         });
      };


      // ball/balls/baller
      case `ball`:
      case `balls`:
      case `baller`: {
         await message.channel.sendTyping();

         const images = await fs.readdir(`./assets/ball`);
         const file   = choice(images);
         const image  = `./assets/ball/${file}`;

         return await message.reply({
            files: [
               new Discord.AttachmentBuilder()
                  .setFile(image)
                  .setDescription(`ball`)
            ],
            allowedMentions: {
               parse: []
            }
         });
      };


      // boop haiii
      case `boop`: {
         if (args[0].toLowerCase() !== `haiii`)
            return;

         return await message.reply({
            content: `boop haiii`,
            allowedMentions: {
               repliedUser: false
            }
         });
      };


      // flip
      case `flip`: {
         return await message.reply({
            content: `🪙 ${choice([ `heads`, `tails` ])}`,
            allowedMentions: {
               repliedUser: false
            }
         });
      };


      // pancake/pancakes
      case `pancake`:
      case `pancakes`: {
         await message.channel.sendTyping();

         const pancakeDocRef  = firestore.collection(`pancake`).doc(message.guild.id);
         const pancakeDocSnap = await pancakeDocRef.get();
         const pancakeDocData = pancakeDocSnap.data() || {};

         const pancakeUserData = pancakeDocData[message.author.id] || {};

         const canGetPancake = (pancakeUserData[`next-pancake-at`]?.seconds || 0) < dayjs().unix();
         if (!canGetPancake)
            return await message.reply({
               content: `You have 🥞 \`${pancakeUserData.pancakes || 0}\` ${pancakeUserData.pancakes === 1 ? `pancake` : `pancakes`}, you can redeem another ${Discord.time(dayjs.utc().startOf(`day`).add(1, `day`).unix(), Discord.TimestampStyles.RelativeTime)}.`,
               allowedMentions: {
                  repliedUser: false
               }
            });

         await pancakeDocRef.update({
            [`${message.author.id}.next-pancake-at`]: new Timestamp(dayjs.utc().startOf(`day`).add(1, `day`).unix(), 0),
            [`${message.author.id}.pancakes`]:        FieldValue.increment(1)
         });

         return await message.reply({
            content: choice([
               `Good to see you again, ${message.author}. Here is your 🥞 pancake!`,
               `Welcome back, fair ${message.author}. Your 🥞 pancake is here.`,
               `Here is your 🥞 pancake, ${message.author}: with ground hazelnuts in the batter.`,
               `Here is your fluffy, syrupy 🥞 pancake, ${message.author}.`,
               `Dear ${message.author}, your 🥞 pancake is here.`,
               `Hello, ${message.author}, your 🥞 pancake awaits you.`,
               `The Solstice *is* real, ${message.author}. Here is your 🥞 pancake.`
            ]),
            allowedMentions: {
               repliedUser: false
            }
         });
      };


      // rate
      case `rate`: {
         const thingToRate = message.content
            .slice(message.content.indexOf(commandName) + commandName.length)
            .trim();

         if (!thingToRate)
            return;

         return await message.reply({
            content: `✨ ${
               choice([
                  `hmm, i'll rate \`${thingToRate}\` a`,
                  `\`${thingToRate}\` gets a`,
                  `i rate \`${thingToRate}\` a`,
                  `\`${thingToRate}\` is a certified`
               ])
            } **\`${number(1, 10)}\`**`,
            allowedMentions: {
               repliedUser: false
            }
         });
      };


      // roll
      case `roll`: {
         return await message.reply({
            content: `🎲 \`${number(1, 6)}\``,
            allowedMentions: {
               repliedUser: false
            }
         });
      };


   };
};