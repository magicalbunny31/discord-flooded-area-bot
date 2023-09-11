/**
 * Area Communities Bot 🌊🌌
 *
 * magicalbunny31 : 2022 - 2023
 * https://nuzzles.dev
 */


// awesome utilities 🐾
import { choice, colours, set } from "@magicalbunny31/awesome-utility-stuff";


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
         name:  `recently started: hold tight~ 🌊🌌`,
         state: `recently started: hold tight~ 🌊🌌`,
         type:  Discord.ActivityType.Custom
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

client.fennec.updater(
   async () => client.application.approximateGuildCount || (await client.application.fetch()).approximateGuildCount
);

client.blacklist = await client.fennec.getGlobalBlacklist();
setInterval(async () => client.blacklist = await client.fennec.getGlobalBlacklist(), 3.6e+6);


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
         return await client.fennec.sendError(error, Math.floor(Date.now() / 1000), `job/${file}`);

      } finally {
         console.warn(`error in schedule! see below~`);
         console.error(error.stack);
         return process.exit(1);
      };
   });
};


// statuses
setInterval(async () => {
   // offline-soon or maintenance
   const fennecStatus = await client.fennec.getStatus();
   if ([ `offline-soon`, `maintenance` ].includes(fennecStatus))
      return client.user.setPresence({
         status: Discord.PresenceUpdateStatus.DoNotDisturb,
         activities: [{
            name:  `${fennecStatus === `offline-soon` ? `i'll be offline soon~` : `currently in maintenance!`} 🔧`,
            state: `${fennecStatus === `offline-soon` ? `i'll be offline soon~` : `currently in maintenance!`} 🔧`,
            type:  Discord.ActivityType.Custom
         }]
      });

   // list of statuses
   const statuses = [
      `Flooded Area 🌊`,
      `Spaced Out 🌌`,
      `visit bunny's shop with /currency shop`,
      `view your level with /levels`,
      `your suggestions are cool`,
      `star messages to get them on the starboard!`,
      `try fox bot`,
      `STOP GRIEFING ME!!!!!`,
      `don't touch the waves :scary:`,
      `when will there be a new challenge?`,
      `trying to build a boat`,
      `trying to build a rocket`,
      `when's the next event?`,
      `hello, chat!`,
      `hello world`,
      `don't dm me for modmail`,
      `i got votekicked for eating bread`,
      `@everyone`,
      `hi`,
      `i hate flooded a`,
      `zzz`,
      `what are you looking at?!`,
      `🤓☝️`,
      `why are you in this server`,
      `balls`,
      `whar`,
      `:3`,
      `/cmd pancakes`,
      `raphael ate ALL my balls and now i'm sad`,
      `erm, what the tuna?`,
      `fish issue`,
      `#hugo2023`,
      `le tape`,
      `rawr ✨`,
      `halo is a cutie`,
      `can i have cool role`,
      `don't get rabies it's bad for you`,
      `why does the sun give us light when it's already bright`,
      `flooded area lost the braincells it never had from spaced out`,
      `flooded area mfs when their family members drown inside a flood and die (flooded area reference)`,
      `sex update when`,
      `/america`,
      `this bot was made by a furry`,
      `sily !`,
      `need a dispenser here`,
      `spy!`,
      `his mom its a cancer`,
      `good morning let's basketball`,
      `HUH`,
      `YOU MASH`,
      `the streets aint for u cuzzz`,
      `NOT READING ALLAT 🤦‍♂️🤣`,
      `be nice to each other`,
      `go back to your cage you animal`,
      `boop haiii`,
      `i forgor`,
      `cheese`,
      `bread`,
      `[BLIZZARD] WAS HERE!!`,
      `boo!`
   ];
   const status = choice(statuses);

   // set presence
   client.user.setPresence({
      status: Discord.PresenceUpdateStatus.Online,
      activities: [{
         name:  status,
         state: status,
         type:  Discord.ActivityType.Custom
      }]
   });
}, 600000); // 10 minutes


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