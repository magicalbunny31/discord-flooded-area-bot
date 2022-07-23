import Discord from "discord.js";
import fuzzysort from "fuzzysort";

import pkg from "../../package.json" assert { type: "json" };

/**
 * ban someone from the flooded area roblox game
 * @param {Discord.AutocompleteInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // options
   const { name: option, value: input } = interaction.options.getFocused(true);


   switch (option) {


      // player-id
      case `player-id`: {
         // get the ids of banned users
         const bannedUsers = await (async () => {
            const response = await fetch(process.env.BAN_DATABASE_URL, {
               headers: {
                  "Accept": `application/json`,
                  "User-Agent": `${pkg.name} (https://github.com/magicalbunny31/discord-flooded-area-bot)`
               }
            });

            if (response.ok)
               return (await response.json())
                  .documents
                  .map(document => document.name.split(`/`).at(-1));

            else
               return null;
         })();


         // get a user by user id
         // https://users.roblox.com/docs#!/Users/get_v1_users_userId
         const getUserByUserId = async userId => {
            const response = await fetch(`https://users.roblox.com/v1/users/${userId}`, {
               headers: {
                  "Accept": `application/json`,
                  "User-Agent": `${pkg.name} (https://github.com/magicalbunny31/discord-flooded-area-bot)`
               }
            });

            if (response.ok)
               return await response.json();

            else
               return null;
         };


         // firebase api failed
         if (!bannedUsers)
            return await interaction.respond([]);


         // banned results
         const bannedResults = (
            await Promise.all(
               bannedUsers
                  .map(async bannedUser => {
                     // this can't be parsed to an id (number)
                     if (isNaN(+bannedUser))
                        return false;

                     // get this user by id
                     const userByUserId = await getUserByUserId(bannedUser);

                     // return data based on a result from the api or not
                     return {
                        name: `📛 ${userByUserId?.displayName || `???`} 👤 @${userByUserId?.name || `???`} 🆔 ${bannedUser}`,
                        value: bannedUser
                     };
                  })
            )
         )
            .filter(Boolean);


         // no input, just return the banned results
         if (!input)
            return await interaction.respond(
               bannedResults.slice(0, 25)
            );


         // fuzzy sort results
         const sortedResults = fuzzysort.go(input, bannedResults, {
            key: `name`,
            limit: 25
         })
            .map(result => result.obj);


         // send autocomplete results
         return await interaction.respond(sortedResults);
      };


   };
};