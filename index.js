/**
 * flooded-area-moderation
 *
 * magicalbunny31 : 2023
 * https://nuzzles.dev
 */



// some awesome utilities that i pretty much need or else my code will suck 🐾
import { colours, noop, strip } from "@magicalbunny31/awesome-utility-stuff";


// filesystem
import fs from "fs/promises";


// load .env
import dotenv from "dotenv";
dotenv.config();


// day.js plugins
import dayjs from "dayjs";

import duration from "dayjs/plugin/duration.js";
dayjs.extend(duration);

import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(relativeTime);


// the discord bot
import Discord from "discord.js";
const client = new Discord.Client({
   intents: [
      Discord.GatewayIntentBits.Guilds,
      Discord.GatewayIntentBits.GuildMessages,
      Discord.GatewayIntentBits.MessageContent
   ],

   partials: [
      Discord.Partials.Message
   ]
});


// an array of users to moderate
// this array will be pulled and updated periodically from the lua server
client.moderations = [];


// listen to events
const events = await fs.readdir(`./events`);
for (const file of events) {
   const event = await import(`./events/${file}`);
   if (!event.once) client.on  (event.name, (...args) => event.default(...args));
   else             client.once(event.name, (...args) => event.default(...args));
};


// log in to discord
await client.login(process.env.TOKEN);


// web server stuff
import fastify from "fastify";
const server = fastify();


// server has received a GET request at the "/" url
server.get(`/`, async (request, response) => {
   // the server responded with moderation info appended to its headers
   // this means that it processed a moderation request
   // the below code in this block will display a message to the command user

   const action = request.headers[`method`];

   if ([ `Ban`, `Kick`, `Unban` ].includes(action)) {
      // constants
      const emojiSuccess = `<a:ingame_moderation_success:1123766876749713508>`;
      const emojiError   = `<a:ingame_moderation_error:1123766878167367770>`;


      // get the message to edit
      const guild      = await client .guilds  .fetch(request.headers[`guild`]);
      const channel    = await guild  .channels.fetch(request.headers[`channel`]);
      const message    = await channel.messages.fetch(request.headers[`message`]);
      const embedIndex = +request.headers[`embedindex`];


      // there was a roblox error
      const receivedRobloxError = request.headers[`rblxerror`];


      // the payload for editing the message
      const payload = {
         embeds: message.embeds.map(embed =>
            new Discord.EmbedBuilder(embed.data)
         ),

         allowedMentions: {
            repliedUser: false
         }
      };

      if (!receivedRobloxError)
         payload.embeds[embedIndex]
            .setDescription(`### ${emojiSuccess} ${
               {
                  "Ban":   `banned player!`,
                  "Kick":  `kicked player from server!`,
                  "Unban": `revoked player's ban!`
               }[action]
            }`);

      else
         payload.embeds[embedIndex]
            .setColor(colours.red)
            .setDescription(strip`
               ### ${emojiError} ${
                  {
                     "Ban":   `failed to ban player`,
                     "Kick":  `failed to kick player from server`,
                     "Unban": `failed to revoke player's ban`
                  }[action]
               }
            `);


      try {
         // try to edit the message
         await message.edit(payload);

      } catch {
         // break
         noop;
      };


      // respond to the request
      return await response
         .status(200)
         .send(`200 OK`);
   };


   // respond with the first item in the moderations array
   response.send(client.moderations.shift());
});


// start the web server
server.listen({ port: process.env.PORT }, async (error, address) => {
   // an error occurred with the web server
   if (error) {
      server.log.error(error);
      process.exit(1);
   };


   // web server is ready
   console.log(`💻 web server listening on ${address}`);
});