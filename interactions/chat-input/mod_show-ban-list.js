import Discord from "discord.js";
import dayjs from "dayjs";

import pkg from "../../package.json" assert { type: "json" };

import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * show the list of banned players from roblox flooded area
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // users
   const magicalbunny31 = await redis.GET(`flooded-area:user:magicalbunny31`);


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
            .filter(document => document.fields?.Banned?.booleanValue || document.fields?.[`Temp-Banned`]?.booleanValue) // only show (temporary) bans
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


   // banned users except they're fetched as roblox users
   // https://users.roblox.com/docs#!/Users/post_v1_users
   let bannedResults = await (async () => {
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

         // return this data
         return bannedUsers;

      } else
         return response.status;
   })();


   // apis failed
   if (typeof bannedResults === `number`)
      return await interaction.editReply({
         content: strip`
            ❌ **can't show the ban list**
            > some scary error occurred with the ban list! try again later maybe
            > give this to ${Discord.userMention(magicalbunny31)}: \`${bannedResults}\`
         `
      });


   // split the ban list array into chunks of 15
   const size = 15;
   bannedResults = Array.from(
      new Array(Math.ceil(bannedResults.length / size)),
      (_element, i) => bannedResults.slice(i * size, i * size + size)
   );


   // temporarily set the ban list array in the database in order for the menu to work
   if (bannedResults.length)
      await redis
         .multi()
         .RPUSH(`flooded-area:temporary-stuff:${interaction.id}`, bannedResults.map(bannedResult => JSON.stringify(bannedResult)))
         .EXPIRE(`flooded-area:temporary-stuff:${interaction.id}`, 86400)
         .exec();


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setDescription(
            bannedResults[0]
               .map(bannedResult => `\\📛 \`${bannedResult.displayName}\` \\👤 \`@${bannedResult.name}\` \\🆔 \`${bannedResult.id}\``)
               .join(`\n`)
         )
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.SelectMenuBuilder()
               .setCustomId(`mod_show-ban-list:${interaction.id}:0`)
               .setPlaceholder(`Select a ban entry to view more on...`)
               .setOptions(
                  bannedResults.length
                     ? bannedResults[0].map(bannedResult =>
                        new Discord.SelectMenuOptionBuilder()
                           .setLabel(`📛 ${bannedResult.displayName} 👤 @${bannedResult.name}`)
                           .setDescription(`🆔 ${bannedResult.id}`)
                           .setValue(`${bannedResult.id}`)
                     )
                     : [
                        new Discord.SelectMenuOptionBuilder()
                           .setLabel(`owo`)
                           .setDescription(`hey! you're not supposed to see this! *bap*`)
                           .setValue(`owo`)
                     ]
               )
               .setDisabled(!bannedResults.length)
         ]),

      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`mod_show-ban-list:${interaction.id}:deez-nuts`) // message component custom ids can't be duplicated, this button is completely cosmetic here
               .setEmoji(`⬅️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(true),
            new Discord.ButtonBuilder()
               .setCustomId(`mod_show-ban-list:${interaction.id}:1`)
               .setEmoji(`➡️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(bannedResults.length <= 1),
            new Discord.ButtonBuilder()
               .setCustomId(`this button shows the pages, that's it`)
               .setLabel(`1 / ${bannedResults.length || 1}`)
               .setStyle(Discord.ButtonStyle.Secondary)
               .setDisabled(true)
         ])
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds,
      components
   });
};