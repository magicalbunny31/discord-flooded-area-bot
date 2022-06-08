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
         name: `your suggestions`,
         type: Discord.ActivityType.Listening
      }]
   },

   intents: [
      Discord.GatewayIntentBits.Guilds,
      Discord.GatewayIntentBits.GuildMessages,
      Discord.GatewayIntentBits.GuildMessageReactions
   ]
});


// listen to events
const events = await readdir(`./events`);
for (const file of events) {
   const event = await import(`./events/${file}`);
   if (!event.once) client.on  (event.name, (...args) => event.default(...args));
   else             client.once(event.name, (...args) => event.default(...args));
};


// log in to discord
await client.login(process.env.TOKEN);