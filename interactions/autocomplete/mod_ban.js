import Discord from "discord.js";

import pkg from "../../package.json" assert { type: "json" };

/**
 * ban a player from roblox Flooded Area
 * @param {Discord.AutocompleteInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // options
   const { name: option, value: input } = interaction.options.getFocused(true);


   switch (option) {


      // player-id
      case `player-id`: {
         // input length must be 3 or more characters long
         if (input.length <= 2)
            return await interaction.respond([]);


         // get a user by user id
         // https://users.roblox.com/docs#!/Users/get_v1_users_userId
         const userByUserId = await (async () => {
            if (!+input)
               return null;

            const response = await fetch(`https://users.roblox.com/v1/users/${input}`, {
               headers: {
                  "Accept": `application/json`,
                  "User-Agent": `${pkg.name} (https://github.com/magicalbunny31/discord-flooded-area-bot)`
               }
            });

            if (response.ok)
               return await response.json();

            else
               return null;
         })();


         // search for players with the input
         // https://users.roblox.com/docs#!/UserSearch/get_v1_users_search
         const searchUsers = await (async () => {
            const response = await fetch(`https://users.roblox.com/v1/users/search?keyword=${input}&limit=25`, {
               headers: {
                  "Accept": `application/json`,
                  "User-Agent": `${pkg.name} (https://github.com/magicalbunny31/discord-flooded-area-bot)`
               }
            });

            if (response.ok)
               return (await response.json()).data;

            else
               return null;
         })();
         

         // searchUsers api errored
         if (!searchUsers)
            return await interaction.respond([]);


         // search results
         const searchResults = [
            ...userByUserId
               ? [{
                  name: `📛 ${userByUserId.displayName} 👤 @${userByUserId.name} 🆔 ${userByUserId.id}`,
                  value: userByUserId.id
               }]
               : [],

            ...searchUsers.map(user => 
               ({
                  name: `📛 ${user.displayName} 👤 @${user.name} 🆔 ${user.id}`,
                  value: user.id
               })
            )
         ]
            .slice(0, 25);


         // send autocomplete results
         return await interaction.respond(searchResults);
      };


   };
};