import Discord from "discord.js";
import fetch from "node-fetch";

import { readFile } from "fs/promises";
const pkg = JSON.parse(await readFile(`./package.json`));

/**
 * @param {Discord.AutocompleteInteraction} interaction
 */
export default async interaction => {
   // options
   const { value: input } = interaction.options.getFocused(true);


   // user-agent for requests
   const userAgent = `${pkg.name}/${pkg.version} (${process.env.GITHUB})`;


   // input length must be 3 or more characters long
   if (input.length < 3)
      return await interaction.respond([]);


   // get a user by user id
   // https://users.roblox.com/docs#!/Users/get_v1_users_userId
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


   // search for players with the input
   // https://users.roblox.com/docs#!/UserSearch/get_v1_users_search
   const searchUsers = await (async () => {
      // send a http get request
      const response = await fetch(`https://users.roblox.com/v1/users/search?keyword=${input}&limit=25`, {
         headers: {
            "Accept": `application/json`,
            "User-Agent": userAgent
         }
      });

      // response is good, return its data
      if (response.ok)
         return (await response.json()).data;

      // something went wrong, return nothing
      else
         return null;
   })();


   // search results
   const searchResults = [
      ...userByUserId
         ? [{
            name: `${userByUserId.displayName} (@${userByUserId.name})`,
            value: userByUserId.id
         }]
         : [],

      ...searchUsers
         ? searchUsers
            .map(user =>
               ({
                  name: `${user.displayName} (@${user.name})`,
                  value: user.id
               })
            )
         : []
   ]
      .slice(0, 25);


   // send autocomplete results
   return await interaction.respond(searchResults);
};