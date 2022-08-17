/**
 * Flooded Area 🌊
 *
 * magicalbunny31 : 2022
 * https://nuzzles.dev
 */


// some awesome utilities that i pretty much need or else my code will suck 🐾
import { sendBotError } from "@magicalbunny31/awesome-utility-stuff";


// filesystem
import { readdir } from "fs/promises";


// load .env
import dotenv from "dotenv";
dotenv.config();


// ffmpeg
import pathToFfmpeg from "ffmpeg-static";
import FFmpeg from "fluent-ffmpeg";
FFmpeg.setFfmpegPath(pathToFfmpeg);


// database
import { createClient } from "redis";
const redis = createClient({
   socket: {
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
      connectTimeout: 300
   },
   password: process.env.REDIS_AUTH
});


// day.js plugins
import dayjs from "dayjs";

import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);


// node-schedule for scheduling tasks
import { scheduleJob } from "node-schedule";


// discord client
import Discord from "discord.js";
const client = new Discord.Client({
   partials: [
      Discord.Partials.Message,
      Discord.Partials.User,
      Discord.Partials.Reaction
   ],

   presence: {
      status: `dnd`
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


// watch schedules
const schedules = await readdir(`./schedules`);
for (const file of schedules) {
   const schedule = await import(`./schedules/${file}`);
   scheduleJob(schedule.cron, async () => await schedule.default(client, redis));
};


// send errors to an error webhook
process.on("uncaughtException", async (error, origin) => {
   await sendBotError(
      `uncaughtException`,
      {
         url: process.env.WEBHOOK_ERRORS
      },
      error.stack
   );

   console.error(error);

   process.exit(1);
});

redis.on(`error`, async error => {
   await sendBotError(
      `redis`,
      {
         url: process.env.WEBHOOK_ERRORS
      },
      error
   );

   console.error(error);

   process.exit(1);
});


// connect to the database
await redis.connect();


// log in to discord
await client.login(process.env.TOKEN);


/**
 * SUGGESTIONS~
 * delete some messages from suggestion channels to clean it up plox
 * after deny, auto-delete suggestion after 24hr
 * dm user if suggestion deleted/updated/etc (opt-in)
 * auto deny suggestions "open for discussion" suggestions that sustain a 90% downvoted rate for 24hr
 * make polls as a suggestion format
 *
 * SUGGESTION SUBMISSIONS~
 * add tutorial
 * add view all suggestions
 * add "view popular suggestions" button to #suggestion-submissions
 * add "view trending suggestions" button #suggestion-submissions (most upvoted in 24hr)
 *
 * TICKETS~
 * am i even doing this? idk. but for now: no, i like ticket bot
 * but i will just recreate it if i get bored
 *
 * /convert-to-video
 */

// TODO revamp /flooded-area statistics (make it subcommand) to show historical data
// TODO new command: set up auto-responses