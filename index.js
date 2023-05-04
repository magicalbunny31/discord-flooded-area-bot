/**
 * Area Communities Bot 🌊
 *
 * magicalbunny31 : 2022 - 2023
 * https://nuzzles.dev
 */


// some awesome utilities that i pretty much need or else my code will suck 🐾
import { colours } from "@magicalbunny31/awesome-utility-stuff";


// utilities for interacting with fennec 💻
import { Client } from "@magicalbunny31/fennec-utilities";


// filesystem
import { readdir } from "fs/promises";


// load .env
import dotenv from "dotenv";
dotenv.config();


// day.js plugins
import dayjs from "dayjs";

import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);

import duration from "dayjs/plugin/duration.js";
dayjs.extend(duration);

import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(relativeTime);


// internationalisation
import i18next from "i18next";
import Backend from "i18next-fs-backend";

i18next.use(Backend).init({
   lng: `en-GB`,
   fallbackLng: `en-GB`,
   initImmediate: false,
   preload: await (async () => (await readdir(`./translations`)).map(file => file.split(`.`).shift()))(),
   backend: {
      loadPath: `./translations/{{lng}}.json`
   }
});


// database
import { Firestore } from "@google-cloud/firestore";
const firestore = new Firestore({
   credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY
   },
   projectId: process.env.GCP_PROJECT_ID,
   ssl: true
});


// discord client
import Discord from "discord.js";
const client = new Discord.Client({
   partials: [
      Discord.Partials.Message,
      Discord.Partials.User,
      Discord.Partials.Reaction,
      Discord.Partials.Channel
   ],

   presence: {
      status: `dnd`
   },

   intents: [
      Discord.GatewayIntentBits.Guilds,
      Discord.GatewayIntentBits.GuildMembers,
      Discord.GatewayIntentBits.GuildMessages,
      Discord.GatewayIntentBits.DirectMessages,
      Discord.GatewayIntentBits.GuildMessageReactions,
      Discord.GatewayIntentBits.MessageContent
   ]
});


// listen to events
const events = await readdir(`./events`);
for (const file of events) {
   const event = await import(`./events/${file}`);
   if (!event.once) client.on  (event.name, (...args) => event.default(...args, firestore));
   else             client.once(event.name, (...args) => event.default(...args, firestore));
};


// log in to discord
await client.login(process.env.TOKEN);


// set-up fennec-utilities
const fennecGuild = await client.guilds.fetch(process.env.GUILD_BOT_LOGS);
const fennecMember = await fennecGuild.members.fetch(client.user);

client.fennec = new Client({
   avatarURL: client.user.avatarURL({
      extension: `png`,
      size: 4096
   }),
   colour: colours.flooded_area,
   formattedName: fennecMember.displayName,
   firestore: {
      clientEmail: process.env.FENNEC_GCP_CLIENT_EMAIL,
      privateKey:  process.env.FENNEC_GCP_PRIVATE_KEY,
      projectId:   process.env.FENNEC_GCP_PROJECT_ID
   },
   id: process.env.FENNEC_ID,
   threadId: process.env.FENNEC_THREAD,
   webhook: {
      url: process.env.FENNEC_WEBHOOK
   }
});

client.fennec.updater(client);

client.blacklist = await client.fennec.getGlobalBlacklist();
setInterval(async () => client.blacklist = await client.fennec.getGlobalBlacklist(), 3.6e+6);


// watch schedules
import { scheduleJob } from "node-schedule";

const schedules = await readdir(`./schedules`);
for (const file of schedules) {
   const schedule = await import(`./schedules/${file}`);
   const job = scheduleJob(schedule.cron, async () => await schedule.default(client, firestore));

   job.on(`error`, async error => {
      try {
         return await client.fennec.sendError(error, Math.floor(Date.now() / 1000), `job/${file}`);

      } finally {
         console.warn(`error in schedule! see below~`);
         console.error(error.stack);
         return process.exit(1);
      };
   });
};


// process events
process.on("uncaughtException", async (error, origin) => {
   try {
      return await client.fennec.sendError(error, Math.floor(Date.now() / 1000), origin);

   } finally {
      console.warn(`error in uncaught exception! see below~`);
      console.error(error.stack);
      return process.exit(1);
   };
});