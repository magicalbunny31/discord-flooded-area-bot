import Discord from "discord.js";
import fuzzysort from "fuzzysort";

import pkg from "../../package.json" assert { type: "json" };

/**
 * revoke a player's ban from roblox Flooded Area
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
                  .map(document => {
                     // get the id
                     const id = document.name.split(`/`).at(-1);

                     // the id couldn't be parsed to a number
                     if (isNaN(+id))
                        return;

                     // return the id
                     return id;
                  })
                  .filter(Boolean);

            else
               return [ 0 ];
         })();


         // banned users except they're fetched as roblox users mapped into choices
         // https://users.roblox.com/docs#!/Users/post_v1_users
         const bannedResults = await (async () => {
            const response = await fetch(`https://users.roblox.com/v1/users`, {
               method: `POST`,
               headers: {
                  "Accept": `application/json`,
                  "Content-Type": `application/json`,
                  "User-Agent": `${pkg.name} (https://github.com/magicalbunny31/discord-flooded-area-bot)`
               },
               body: JSON.stringify({
                  userIds: bannedUsers,
                  excludeBannedUsers: false
               })
            });

            if (response.ok) {
               // data from the roblox api
               const { data } = await response.json();

               // loop each id and replace its entry in the array
               for (const index in bannedUsers) {
                  bannedUsers[index] = data.find(user => `${user.id}` === bannedUsers[index])
                     ? data.find(user => `${user.id}` === bannedUsers[index])
                     : { id: bannedUsers[index], name: `???`, displayName: `???` }
               };

               // sort this data into choices for the interaction
               return bannedUsers.map(data =>
                  ({
                     name: `📛 ${data.displayName} 👤 @${data.name} 🆔 ${data.id}`,
                     value: `${data.id}`
                  })
               );

            } else
               return null;
         })();


         // apis failed
         if (!bannedResults)
            return await interaction.respond([]);


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