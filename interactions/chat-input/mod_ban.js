import Discord from "discord.js";
import dayjs from "dayjs";

import pkg from "../../package.json" assert { type: "json" };

import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * ban a player from roblox flooded area
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // options
   const playerId = interaction.options.getInteger(`player-id`);
   const reason = interaction.options.getString(`reason`);
   const banDuration = interaction.options.getInteger(`ban-duration`);


   // users and channels
   const [ magicalbunny31, banLogs ] = await redis.MGET([ `flooded-area:user:magicalbunny31`, `flooded-area:channel:ban-logs` ]);


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // get this user's roblox profile
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
            ❌ **can't ban this user**
            > ${
               userProfile.status === 404
                  ? `the id \`${playerId}\` isn't a valid roblox user chief` // not found
                  : `some scary error occurred with the roblox api! try again later maybe`
            }
         `
      });


   // get this user's avatar headshot
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


   // this user
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


   // this user is already banned
   if (isBanned.ok === true) {
      const moderator = await redis.HGET(`flooded-area:ban-logs:${playerId}`, `moderator`);

      return await interaction.editReply({
         content: strip`
            ❌ **can't ban this user**
            > \`@${name}\` ${
               moderator
                  ? `was banned by ${Discord.userMention(moderator)} ${Discord.time(isBanned.bannedAt, Discord.TimestampStyles.RelativeTime)}`
                  : `is already banned`
            }
         `,
         allowedMentions: {
            parse: []
         }
      });
   };


   // response isn't okai
   if (isBanned.ok === false) // must be explicitly false
      return await interaction.editReply({
         content: strip`
            ❌ **can't ban this user**
            > some scary error occurred with the ban list! try again later maybe
            > give this to ${Discord.userMention(magicalbunny31)}: \`${isBanned.status}\`
         `
      });


   // add this player's id to the ban database
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
            ❌ **can't ban this user**
            > some scary error occurred with the ban list! try again later maybe
            > give this to ${Discord.userMention(magicalbunny31)}: \`${isBanned.status}\`
         `
      });


   // set who banned this person in the database
   await redis.HSET(`flooded-area:ban-logs:${playerId}`, {
      "moderator": interaction.user.id
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
            🔨 **banned \`@${name}\`!**
            > might want to log this ban in ${Discord.channelMention(banLogs)} now

            📝 **reason**
            > ${reason}
         `)
         .setFooter({
            text: strip`
               📋 the ban list is refreshed every 15 seconds,
               🔨 so be patient if they're not actually banned yet >.>
            `
         })
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds
   });
};