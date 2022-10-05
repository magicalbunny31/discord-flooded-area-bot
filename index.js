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


// day.js plugins
import dayjs from "dayjs";

import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);


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


/**
 * SUGGESTIONS~
 * after deny, auto-delete suggestion after 24hr
 * dm user if suggestion deleted/updated/etc (opt-in)
 *
 * TICKETS~
 * am i even doing this? idk. but for now: no, i like ticket bot
 * but i will just recreate it if i get bored
 */

// TODO revamp /flooded-area statistics (make it subcommand) to show historical data