/**
 * Area Communities Bot 🌊
 *
 * magicalbunny31 : 2022 - 2023
 * https://nuzzles.dev
 */


// some awesome utilities that i pretty much need or else my code will suck 🐾
import { sendBotError } from "@magicalbunny31/awesome-utility-stuff";


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


// send errors to an error webhook
process.on("uncaughtException", async (error, origin) => {
   await sendBotError(
      `uncaughtException`,
      {
         url: process.env.WEBHOOK_ERRORS
      },
      error
   );

   console.error(error);
   process.exit();
});


// log in to discord
await client.login(process.env.TOKEN);


// watch schedules
import { scheduleJob } from "node-schedule";

const schedules = await readdir(`./schedules`);
for (const file of schedules) {
   const schedule = await import(`./schedules/${file}`);
   const job = scheduleJob(schedule.cron, async () => await schedule.default(client, firestore));

   job.on(`error`, async error =>
      await sendBotError(
         `job/${file}`,
         {
            url: process.env.WEBHOOK_ERRORS
         },
         error
      )
   );
};


// TODO revamp /flooded-area statistics (make it subcommand) to show historical data




// import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";
// const guild = await client.guilds.fetch(`977254354589462618`);
// const channel = await guild.channels.fetch(`977254355319283744`);
// const thread = await channel.threads.fetch(`1018616540389711953`);

// await thread.send({
//    embeds: [
//       new Discord.EmbedBuilder()
//          .setColor(colours.flooded_area)
//          .setTitle(`Parts 🧱`)
//          .setDescription(strip`
//             **finding it out in the open**
//             > \`Balloon\` : \\🎈 balloon
//             > \`Bread\` : \\🍞 bread
//             > \`Cake\` : \\🍰 cake

//             **crafting or part packs**
//             > ...
//          `)
//          .setFooter({
//             iconURL: `https://cdn.discordapp.com/emojis/995461994989756526.webp`,
//             text: `/get-part-info <part>`
//          }),
//       new Discord.EmbedBuilder()
//          .setColor(colours.flooded_area)
//          .setTitle(`Maps 🗺️`)
//          .setDescription(strip`
//             **survival**
//             > \`Resource Haven\` : \\⛰️ resource haven
//             > \`Encave\` : \\⛰️ encave
//             > \`The Silent Hotel\` : \\🏨 the silent hotel

//             **two-team elimination**
//             > ...
//          `)
//          .setFooter({
//             iconURL: `https://cdn.discordapp.com/emojis/995461994989756526.webp`,
//             text: `/get-map-info <map>`
//          })
//    ]
// });





// await (await (await client.guilds.fetch(`977254354589462618`)).channels.fetch(`1072945802256855170`)).send({
//    content: ``
// });