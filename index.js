/**
 * Flooded Area Suggestions
 *
 * magicalbunny31 : 2022
 * https://nuzzles.dev
 */


// filesystem
import { readdir } from "fs/promises";


// load .env
import dotenv from "dotenv";
dotenv.config();


// database
import { createClient } from "redis";
const redis = createClient({
   socket: {
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT
   },
   password: process.env.REDIS_AUTH
});


// day.js plugins
import dayjs from "dayjs";

import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);


// discord client
import Discord from "discord.js";
const client = new Discord.Client({
   partials: [
      Discord.Partials.Message,
      Discord.Partials.User,
      Discord.Partials.Reaction
   ],

   presence: {
      activities: [{
         name: `the waves 🌊`,
         type: Discord.ActivityType.Listening
      }]
   },

   intents: [
      Discord.GatewayIntentBits.Guilds,
      Discord.GatewayIntentBits.GuildMembers,
      Discord.GatewayIntentBits.GuildMessages,
      Discord.GatewayIntentBits.GuildMessageReactions,
      Discord.GatewayIntentBits.MessageContent
   ]
});


// listen to events
const events = await readdir(`./events`);
for (const file of events) {
   const event = await import(`./events/${file}`);
   if (!event.once) client.on  (event.name, (...args) => event.default(...args, redis));
   else             client.once(event.name, (...args) => event.default(...args, redis));
};


// connect to the database
await redis.connect();


// log in to discord
await client.login(process.env.TOKEN);



// import { strip } from "@magicalbunny31/awesome-utility-stuff";


// const guild = await client.guilds.fetch(`977254354589462618`);
// const channel = await guild.channels.fetch(`983391983487815791`);

// const ms = [];
// let lastId = ``;

// while (true) {
//    console.log(`fetching messages..`);

//    const messages = (await channel.messages.fetch({ limit: 100, ...ms.at(-1) ? { before: ms.at(-1) } : {} }))
//       .filter(message => message.author.id === client.user.id).map(message => message.id);
//    ms.push(...messages);

//    if (lastId === messages.at(-1)) break;
//    else lastId = messages.at(-1);
// };


// for (const [ i, id ] of ms.entries()) {
//    console.log(`setting in database.. [ ${i + 1}/${ms.length} ]`);

//    const message = await channel.messages.fetch(id);
//    const userId = message.embeds[0]?.data.author.name.match(/\([^()]*\)/g)?.pop().slice(1, -1);
//    if (!userId) continue;

//    const upvotes = await message.reactions.cache.get(`⬆️`).users.fetch();
//    const downvotes = await message.reactions.cache.get(`⬇️`).users.fetch();

//    const user = await client.users.fetch(userId);
//    const embed = new Discord.EmbedBuilder(message.embeds[0].data)
//       .setAuthor({
//          name: user.tag,
//          iconURL: user.displayAvatarURL()
//       });
//    await message.edit({
//       embeds: [ embed ],
//       components: []
//    });


//    await redis.HSET(`flooded-area:part-suggestions:${id}`, {
//       "suggester": userId,
//       "name": message.embeds[0].fields[0].value,
//       "description": message.embeds[0].fields[1].value,
//       "created-timestamp": JSON.stringify(message.createdTimestamp),
//       "last-updated-timestamp": JSON.stringify(message.createdTimestamp),

//       ...message.embeds[0].image?.url
//          ? {
//             "image-url": message.embeds[0].image.url
//          }
//          : {},
//       "message-url": message.url,

//       "status": `open for discussion`,
//       "locked": JSON.stringify(false),
//       "deleted": JSON.stringify(false),

//       "upvotes": JSON.stringify(upvotes.size - 1),
//       "upvoters": JSON.stringify(upvotes.map(user => user.id).filter(id => id !== client.user.id)),
//       "downvotes": JSON.stringify(downvotes.size - 1),
//       "downvoters": JSON.stringify(downvotes.map(user => user.id).filter(id => id !== client.user.id)),

//       "edits": JSON.stringify([])
//    });

//    const maxLength = 30;
//    const splitThreadName = message.embeds[0].fields[0].value.replace(/[\n]+/g, ` `).split(` `);
//    let threadName = ``;
//    for (const [ i, word ] of splitThreadName.entries()) {
//       if (threadName.trim().length + word.length >= maxLength) {
//          threadName = `💬 ${threadName.trim() || word.slice(0, maxLength)}...`;
//          break;
//       } else {
//          threadName += ` ${word}`;
//          if (i + 1 === splitThreadName.length)
//             threadName = `💬 ${threadName.trim()}`;
//       };
//    };

//    if (message.hasThread) {
//       if (message.thread.archived)
//          await message.thread.setArchived(false);

//       await message.thread.edit({
//          name: threadName
//       });

//    } else
//       await message.startThread({
//          name: threadName
//       });

//    await message.thread.send({
//       embeds: [
//          new Discord.EmbedBuilder()
//             .setColor(0x4de94c)
//             .setTitle(`\\#️⃣ Suggestion Discussions`)
//             .setDescription(strip`
//                **🎫 Status**
//                > Open for discussion since ${Discord.time(Math.floor(message.thread.createdTimestamp / 1000), Discord.TimestampStyles.RelativeTime)}.

//                **📝 Edits**
//                > No edits to list.
//             `)
//       ],
//       components: [
//          new Discord.ActionRowBuilder()
//             .setComponents([
//                new Discord.ButtonBuilder()
//                   .setCustomId(`edit-suggestion:${id}`)
//                   .setLabel(`Edit Suggestion`)
//                   .setEmoji(`📝`)
//                   .setStyle(Discord.ButtonStyle.Secondary)
//             ]),
//          new Discord.ActionRowBuilder()
//             .setComponents([
//                new Discord.SelectMenuBuilder()
//                   .setCustomId(`suggestion-settings:${id}`)
//                   .setPlaceholder(`🔧 Suggestion Settings...`)
//                   .setOptions([
//                      new Discord.SelectMenuOptionBuilder()
//                         .setLabel(`Approve Suggestion`)
//                         .setDescription(`Set this suggestion's status as approved.`)
//                         .setValue(`approve-suggestion`)
//                         .setEmoji(`✅`),
//                      new Discord.SelectMenuOptionBuilder()
//                         .setLabel(`Deny Suggestion`)
//                         .setDescription(`Set this suggestion's status as denied.`)
//                         .setValue(`deny-suggestion`)
//                         .setEmoji(`❎`),
//                      new Discord.SelectMenuOptionBuilder()
//                         .setLabel(`Lock Suggestion`)
//                         .setDescription(`Lock this suggestion's votes.`)
//                         .setValue(`lock-suggestion`)
//                         .setEmoji(`🔒`),
//                      new Discord.SelectMenuOptionBuilder()
//                         .setLabel(`Delete Suggestion`)
//                         .setDescription(`Removes this suggestion and deletes this thread.`)
//                         .setValue(`delete-suggestion`)
//                         .setEmoji(`🗑️`)
//                   ])
//             ])
//       ]
//    });
// };

// process.exit(0)



/**
 * SLASH COMMANDS~
 * /view-suggestions <open for discussion/approved/denied>: for mods to view suggestions that are open for discussion/approved/denied
 * /america: add counter because funny
 * /idk: move all of the above commented code to a slash command
 *       - replace message commands with slash commands for myself
 * /global-ban <playerId>: step 1 learn firebase db
 *
 * SUGGESTIONS~
 * prevent duplicate suggestions
 * auto-lock votes when approved/denied
 * ability to edit suggestions
 * make locked votes suggestions actually work
 * - maybe lock thread too??
 * -- lock thread button??
 * improve speed of votes/vote removing/embed colour changing
 * edit name of user#discrim on member update in suggestion embeds through GUILD_MEMBER_UPDATE
 *
 * SUGGESTION SUBMISSIONS~
 * add tutorial
 * add view all suggestions
 * add "view popular suggestions" button to #suggestion-submissions
 * add "view hot suggestions" button #suggestion-submissions (most upvoted in 24hr)
 *
 * REACTION ROLES~
 * add this plox kthx
 *
 * TICKETS~
 * am i even doing this idk but for now no i like ticket bot
 * but i will just recreate it if i get bored
 */