export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";
import fetch from "node-fetch";
import dayjs from "dayjs";

import { readFile } from "fs/promises";
const pkg = JSON.parse(await readFile(`./package.json`));

/**
 * handles all interactions sent to the bot
 * @param {Discord.Interaction} interaction
 */
export default async interaction => {
   // this is for AutocompleteInteractions
   if (!interaction.isAutocomplete())
      return;


   // member doesn't have the role needed to use commands
   if (!interaction.member.roles.cache.has(process.env.ROLE))
      return await interaction.respond([]);


   // user-agent for requests
   const userAgent = `${pkg.name}/${pkg.version} (${process.env.GITHUB})`;


   // options
   const { name, value: rawInput } = interaction.options.getFocused(true);
   const input = rawInput.trim();


   // what each option does
   switch (name) {


      // player
      default: {
         // fetch player usernames
         // https://users.roblox.com/docs
         const userByUsername = await (async () => {
            // send a http post request
            const response = await fetch(`https://users.roblox.com/v1/usernames/users`, {
               method: `POST`,
               headers: {
                  "Accept": `application/json`,
                  "Content-Type": `application/json`,
                  "User-Agent": userAgent
               },
               body: JSON.stringify({
                  usernames: [ input ]
               })
            });

            // response is good, return its data
            if (response.ok)
               return (await response.json()).data[0];

            // something went wrong, return nothing
            else
               return null;
         })();


         // get a user by user id
         // https://users.roblox.com/docs
         const userByUserId = await (async () => {
            // this isn't a user id, can't get a player
            if (!+input)
               return null;

            // send a http get request
            const response = await fetch(`https://users.roblox.com/v1/users/${input}`, {
               headers: {
                  "Accept": `application/json`,
                  "User-Agent": userAgent
               }
            });

            // response is good, return its data
            if (response.ok)
               return await response.json();

            // something went wrong, return nothing
            else
               return null;
         })();


         // search results
         const searchResults = [
            ...userByUsername
               ? [{
                  name: `${userByUsername.displayName} (@${userByUsername.name})`,
                  value: userByUsername.id
               }]
               : [],

            ...userByUserId
               ? [{
                  name: `${userByUserId.displayName} (@${userByUserId.name})`,
                  value: userByUserId.id
               }]
               : []
         ]
            .slice(0, 25);


         // send autocomplete results
         return await interaction.respond(searchResults);
      };


      // duration
      case `duration`: {
         // turn the input into a length
         const length = (() => {
            // the length in seconds
            let length = 0;

            if (!isNaN(+input)) { // the argument is the length in seconds
               length = +input;

            } else { // no, the length isn't in seconds! parse it
               const splitTimes = [ ...input?.matchAll(/[0-9]+[a-z]/g) || [] ].map(match => match[0]);
               for (const splitTime of splitTimes) {
                  const [ unitLength, unit ] = [ ...splitTime.matchAll(/[0-9]+|[a-z]/g) ].map(match => match[0]);
                  switch (unit) {
                     case `s`: length += +unitLength;          break;
                     case `m`: length += +unitLength *     60; break;
                     case `h`: length += +unitLength *   3600; break;
                     case `d`: length += +unitLength *  86400; break;
                     case `w`: length += +unitLength * 604800; break;
                  };
               };
            };

            // return the length (in seconds)
            return length;
         })();


         /**
          * show default options if:
          * - invalid length
          * - input is less than 1 second
          * - input exceeds the max safe integer
          */
         if (!length || length < 1 || length > Number.MAX_SAFE_INTEGER)
            return await interaction.respond(
               [{
                  name: `✨ 30 minutes`,
                  value: 1800
               }, {
                  name: `✨ 1 hour`,
                  value: 3600
               }, {
                  name: `✨ 6 hours`,
                  value: 21600
               }, {
                  name: `✨ 1 day`,
                  value: 86400
               }, {
                  name: `✨ 3 days`,
                  value: 259200
               }, {
                  name: `✨ 1 week`,
                  value: 604800
               }, {
                  name: `✨ 2 weeks`,
                  value: 1209600
               }, {
                  name: `✨ 1 month`,
                  value: 2592000
               }]
            );


         // format the duration to a human-readable string
         const formattedDuration = (() => {
            const format = [];
            const duration = dayjs.duration(length, `seconds`);

            const days = (duration.years() * 365) + (duration.months() * 30) + duration.days();

            if (duration.asDays()    >= 1) format.push(`${days} ${days === 1 ? `day` : `days`}`);
            if (duration.asHours()   >= 1) format.push(`${duration.hours()} ${duration.hours() === 1 ? `hour` : `hours`}`);
            if (duration.asMinutes() >= 1) format.push(`${duration.minutes()} ${duration.minutes() === 1 ? `minute` : `minutes`}`);
            if (duration.asSeconds() >= 1) format.push(`${duration.seconds()} ${duration.seconds() === 1 ? `second` : `seconds`}`);

            return format.join(`, `);
         })();


         // send autocomplete results
         return await interaction.respond(
            [{
               name: formattedDuration,
               value: length
            }]
         );


      };
   };
};