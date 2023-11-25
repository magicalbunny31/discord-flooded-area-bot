/**
 * Area Communities Bot 🌊🌌
 *
 * magicalbunny31 : 2022 - 2023
 * https://nuzzles.dev
 */


// awesome utilities 🐾
import { colours, set, noop } from "@magicalbunny31/awesome-utility-stuff";


// utilities for interacting with fennec 💻
import { Client } from "@magicalbunny31/fennec-utilities";


// filesystem
import fs from "fs/promises";


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


// database
import { Firestore } from "@google-cloud/firestore";
const firestore = new Firestore({
   credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY
   },
   ignoreUndefinedProperties: true,
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
      status: Discord.PresenceUpdateStatus.DoNotDisturb,
      activities: [{
         name: `recently started: hold tight~ 🌊🌌`,
         type: Discord.ActivityType.Custom
      }]
   },

   intents: [
      Discord.GatewayIntentBits.Guilds,
      Discord.GatewayIntentBits.GuildMembers,
      Discord.GatewayIntentBits.GuildMessages,
      Discord.GatewayIntentBits.DirectMessages,
      Discord.GatewayIntentBits.GuildMessageReactions,
      Discord.GatewayIntentBits.MessageContent,
      Discord.GatewayIntentBits.GuildVoiceStates
   ]
});


// log in to discord
await client.login(process.env.TOKEN);


// set-up fennec-utilities
const fennecGuild = await client.guilds.fetch(process.env.GUILD_APPLICATION_STATUS);
const fennecMember = await fennecGuild.members.fetch(client.user);

client.fennec = new Client({
   firestore: {
      clientEmail:  process.env.FENNEC_GCP_CLIENT_EMAIL,
      documentName: process.env.FENNEC_ID,
      privateKey:   process.env.FENNEC_GCP_PRIVATE_KEY,
      projectId:    process.env.FENNEC_GCP_PROJECT_ID
   },
   postSettings: {
      displayedAvatar: client.user.avatarURL({
         extension: `png`,
         size: 4096
      }),
      displayedName:   fennecMember.displayName,
      embedColour:     colours.flooded_area,
      threadId:        process.env.FENNEC_THREAD
   },
   supportGuild: process.env.SUPPORT_GUILD
});

client.blacklist = await client.fennec.getGlobalBlacklist();


// application commands
client.interactions = {};
for (const interaction of await fs.readdir(`./interactions`))
   client.interactions[interaction] = new Discord.Collection();

for (const interaction of await fs.readdir(`./interactions`)) {
   const interactions = await fs.readdir(`./interactions/${interaction}`);

   for (const file of interactions) {
      const data = await import(`./interactions/${interaction}/${file}`);
      client.interactions[interaction].set(data.name, data);
   };
};

const guilds = set(
   client.interactions[`chat-input`]
      .filter(command => command.guilds?.length)
      .map(command => command.guilds)
      .flat()
);

for (const guildId of guilds) {
   const commands = client.interactions[`chat-input`]                       // collection of commands
      .concat(client.interactions.user)                                     // add context menu commands
      .filter(command => command.data && command.guilds?.includes(guildId)) // filter out subcommand/subcommand group files and guild commands, and that this command belongs to this guild
      .map(command => command.data);                                        // map these commands by their data

   await client.application.commands.set(commands, guildId);
};


// voice channel disconnections
client.voiceChannelDisconnector = new Discord.Collection();


// listen to events
const events = await fs.readdir(`./events`);
for (const file of events) {
   const event = await import(`./events/${file}`);
   if (!event.once) client.on  (event.name, (...args) => event.default(...args, firestore));
   else             client.once(event.name, (...args) => event.default(...args, firestore));
};


// watch schedules
import { scheduleJob } from "node-schedule";

const schedules = await fs.readdir(`./schedules`);
for (const file of schedules) {
   const schedule = await import(`./schedules/${file}`);
   const job = scheduleJob(schedule.cron, async () => await schedule.default(client, firestore));

   job.on(`error`, async error => {
      try {
         await client.fennec.sendError(error, Math.floor(Date.now() / 1000), `job/${file}`);

      } catch {
         noop;

      } finally {
         console.warn(`error in schedule! see below~`);
         console.error(error.stack);
         process.exit(1);
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


// log to console once everything is done
console.log(`@${client.user.username} 🌊🌌 is ready~`);


// miscellaneous lines below!!