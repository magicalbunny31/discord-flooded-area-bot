import Discord from "discord.js";
import dayjs from "dayjs";

import pkg from "../../package.json" assert { type: "json" };

import { strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * modify a player's ban from roblox flooded area
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // modal info
   const [ _modal, playerId ] = interaction.customId.split(`:`);


   // fields
   const reason = interaction.fields.getTextInputValue(`reason`);
   const banDuration = interaction.fields.getField(`ban-duration`); // select menu


   // users and channels
   const magicalbunny31 = await redis.GET(`flooded-area:user:magicalbunny31`);


   // check if this user is already banned or not
   const isBanned = await (async () => {
      const response = await fetch(`${process.env.BAN_DATABASE_URL}/${playerId}`, {
         headers: {
            "Accept": `application/json`,
            "User-Agent": `${pkg.name} (https://github.com/magicalbunny31/discord-flooded-area-bot)`
         }
      });

      if (response.ok)
         return {
            ok: true,
            bannedAt: dayjs((await response.json()).createTime).unix()
         };

      else
         return response.status === 404
            ? false
            : {
               ok: false,
               status: response.status
            };
   })();


   // this user is no longer banned
   if (!isBanned) {
      // disable the modify ban button
      interaction.message.components[0].components[
         interaction.message.components[0].components.length === 2
            ? 1 : 0
      ].data.disabled = true;

      // update the interaction
      return await interaction.update({
         embeds: [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setDescription(strip`
                  ❌ **can't edit this ban**
                  > the id \`${playerId}\` is no longer banned, chief
               `)
         ],
         components: interaction.message.components
      });
   };


   // response isn't okai
   if (isBanned.ok === false) { // must be explicitly false
      // disable the modify ban button
      interaction.message.components[0].components[
         interaction.message.components[0].components.length === 2
            ? 1 : 0
      ].data.disabled = true;

      return await interaction.update({
         embeds: [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setDescription(strip`
                  ❌ **can't edit this ban**
                  > some scary error occurred with the ban list! try again later maybe
                  > give this to ${Discord.userMention(magicalbunny31)}: \`${isBanned.status}\`
               `)
         ],
         components: interaction.message.components
      });
   };


   // edit this player's ban
   const editBan = await (async () => {
      const response = await fetch(`${process.env.BAN_DATABASE_URL}/${playerId}`, {
         method: `PATCH`,
         headers: {
            "Accept": `application/json`,
            "Content-Type": `application/json`,
            "User-Agent": `${pkg.name} (https://github.com/magicalbunny31/discord-flooded-area-bot)`
         },
         body: JSON.stringify({
            fields: {
               Reason: {
                  stringValue: reason
               },
               Banned: { // TODO with temporary bans, this value should be changed to "Temp-Banned"
                  booleanValue: true
               }
            }
         })
      });

      if (response.ok)
         return true;

      else
         return {
            ok: false,
            status: `${response.status} ${response.statusText}`
         };
   })();


   // get this banned user
   const bannedUser = await (async () => {
      const response = await fetch(`${process.env.BAN_DATABASE_URL}/${playerId}`, {
         headers: {
            "Accept": `application/json`,
            "User-Agent": `${pkg.name} (https://github.com/magicalbunny31/discord-flooded-area-bot)`
         }
      });

      if (response.ok)
         return await response.json();

      else
         return {
            ok: false,
            status: response.status
         };
   })();


   // response isn't okai
   if (editBan?.ok === false || bannedUser?.ok === false) {
      // disable the modify ban button
      interaction.message.components[0].components[
         interaction.message.components[0].components.length === 2
            ? 1 : 0
      ].data.disabled = true;

      return await interaction.update({
         embeds: [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setDescription(strip`
                  ❌ **can't ban this user**
                  > some scary error occurred with the ban list! try again later maybe
                  > give this to ${Discord.userMention(magicalbunny31)}: \`${isBanned.status}\`
               `)
         ],
         components: interaction.message.components
      });
   };


   // update who last modified this ban in the database
   await redis.HSET(`flooded-area:ban-logs:${playerId}`, {
      "last-modified-by": interaction.user.id
   });


   // this banned user
   const createdAtTimestamp = dayjs(bannedUser.createTime).unix();
   const updatedAtTimestamp = dayjs(bannedUser.updateTime).unix();

   const { moderator } = await redis.HGETALL(`flooded-area:ban-logs:${playerId}`);


   // embeds
   const embeds = [
      new Discord.EmbedBuilder(interaction.message.embeds[0].data)
         .setDescription(
            [
               strip`
                  📝 **ban reason**
                  > ${reason}
               `,

               ...moderator
                  ? [
                     strip`
                        👤 **moderator**
                        > ${Discord.userMention(moderator)}
                     `
                  ]
                  : [],

               strip`
                  🗓️ **dates**
                  > banned at ${Discord.time(createdAtTimestamp)} (${Discord.time(createdAtTimestamp, Discord.TimestampStyles.RelativeTime)})
                  > last modified at ${Discord.time(updatedAtTimestamp)} by ${interaction.user}
               `,
            ]
               .join(`\n\n`)
         )
   ];


   // update the interaction
   return await interaction.update({
      embeds
   });
};