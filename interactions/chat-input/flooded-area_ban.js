import Discord from "discord.js";

import pkg from "../../package.json" assert { type: "json" };

import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * view current statistics for flooded area on roblox
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // options
   const playerId = interaction.options.getInteger(`player-id`);
   const reason = interaction.options.getString(`reason`);
   const banUntil = interaction.options.getInteger(`ban-until`);


   // defer the interaction
   await interaction.deferReply();


   // get this banned user's roblox profile
   // https://users.roblox.com/docs#!/Users/get_v1_users_userId
   const userProfile = await (async () => {
      const response = await fetch(`https://users.roblox.com/v1/users/${playerId}`, {
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
   if (userProfile?.ok === false)
      return await interaction.editReply({
         content: strip`
            ❌ **Couldn't ban this user.**
            > ${
               userProfile.status === 404
                  ? `Id \`${playerId}\` is not a valid Roblox user.` // not found
                  : `An error occurred trying to query the Roblox API, try again later.`
            }
         `
      });


   // get this banned user's avatar headshot
   // https://thumbnails.roblox.com/docs#!/Avatar/get_v1_users_avatar_headshot
   const userAvatarHeadshot = await (async () => {
      const response = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${playerId}&size=720x720&format=Png&isCircular=false`, {
         headers: {
            "Accept": `application/json`,
            "User-Agent": `${pkg.name} (https://github.com/magicalbunny31/discord-flooded-area-bot)`
         }
      });

      if (response.ok) {
         const data = (await response.json()).data;

         if (data.length)
            return data[0].imageUrl;

         // invalid user id
         else
            return null;

      } else
         return null;
   })();


   // this banned user
   const { displayName, name } = userProfile;
   const profileURL = `https://www.roblox.com/users/${playerId}/profile`;


   // check if this user is already banned or not
   const isBanned = await (async () => {
      const response = await fetch(`${process.env.BAN_DATABASE_URL}/${playerId}`, {
         headers: {
            "Accept": `application/json`,
            "User-Agent": `${pkg.name} (https://github.com/magicalbunny31/discord-flooded-area-bot)`
         }
      });

      if (response.ok)
         return true;

      else
         return response.status === 404
            ? false
            : {
               ok: false,
               status: response.status
            };
   })();


   // this user is already banned
   if (isBanned)
      return await interaction.editReply({
         content: strip`
            ❌ **Couldn't ban this user.**
            > \`@${name}\` is already banned.
         `
      });


   // response isn't okai
   if (isBanned?.ok === false)
      return await interaction.editReply({
         content: strip`
            ❌ **Couldn't ban this user.**
            > An error occurred trying to view the ban list, try again later.
            > \`${bannedUser.status}\`
         `
      });


   // add this user's id to the ban database
   const bannedUser = await (async () => {
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
               Banned: {
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


   // response isn't okai
   if (bannedUser?.ok === false)
      return await interaction.editReply({
         content: strip`
            ❌ **Couldn't ban this user.**
            > An error occurred trying to add this user to the ban list, try again later.
            > \`${bannedUser.status}\`
         `
      });


   // send to the ban logs channel
   const channelId = await redis.GET(`flooded-area:channels:ban-logs`);
   const channel = await interaction.guild.channels.fetch(channelId);

   await channel.send({
      content: `${interaction.user} permanently banned ${Discord.hyperlink(`@${name}`, profileURL, `${profileURL} 🔗`)} (\`${playerId}\`) ${Discord.time(Math.floor(interaction.createdTimestamp / 1000), Discord.TimestampStyles.RelativeTime)}.`
   });


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setAuthor({
            name: `${displayName} @${name} (${playerId})`,
            iconURL: userAvatarHeadshot,
            url: profileURL
         })
         .setDescription(strip`
            ✅ **Banned \`@${name}\` from ${Discord.hyperlink(`Flooded Area`, `https://www.roblox.com/games/3976767347/Flooded-Area`, `https://www.roblox.com/games/3976767347/Flooded-Area 🔗`)} for \`${reason}\`.**
            > Bans are refreshed at a 30 second interval.
            > It may take a bit of time before \`@${name}\` is actually banned.
         `)
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds
   });
};