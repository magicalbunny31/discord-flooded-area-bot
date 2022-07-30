import Discord from "discord.js";
import dayjs from "dayjs";

import pkg from "../../package.json" assert { type: "json" };

import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * get some pawesome info of a player's roblox flooded area ban
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // options
   const playerId = interaction.options.getString(`player-id`);


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


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
   if (bannedUser?.ok === false)
      return await interaction.editReply({
         content: strip`
            ❌ **can't get this ban entry**
            > ${
               bannedUser.status === 404
                  ? `the id \`${playerId}\` wasn't found in the ban list chief` // not found
                  : `some scary error occurred with the ban list! try again later maybe`
            }
         `
      });


   // this user isn't (temporarily) banned
   if (!(bannedUser.fields?.Banned?.booleanValue || bannedUser.fields?.[`Temp-Banned`]?.booleanValue))
      return await interaction.editReply({
         content: strip`
            ❌ **can't get this ban entry**
            > this player isn't banned, chief
         `
      });


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
         return null;
   })();


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
   const robloxApiErrored = !userProfile;

   const reason = bannedUser.fields.Reason?.stringValue || `**\`no reason found\`**`;
   const createdAtTimestamp = dayjs(bannedUser.createTime).unix();
   const updatedAtTimestamp = dayjs(bannedUser.updateTime).unix();

   const displayName =     userProfile?.displayName || `???`;
   const name        = `@${userProfile?.name        || `???`}`;

   const profileURL = userProfile
      ? `https://www.roblox.com/users/${playerId}/profile`
      : null;

   const { moderator, "last-modified-by": lastModifiedBy } = await redis.HGETALL(`flooded-area:ban-logs:${playerId}`);


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setAuthor({
            name: `${displayName} ${name} (${playerId})`,
            iconURL: userAvatarHeadshot,
            url: profileURL
         })
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
                  🗓️ **banned at**
                  > ${Discord.time(createdAtTimestamp)} (${Discord.time(createdAtTimestamp, Discord.TimestampStyles.RelativeTime)})
                  ${
                     lastModifiedBy
                        ? `> last modified at ${Discord.time(updatedAtTimestamp)} by ${Discord.userMention(lastModifiedBy)}`
                        : ``
                  }
               `
            ]
               .join(`\n\n`)
         )
         .setFooter({
            text: robloxApiErrored
               ? strip`
                  💥 the roblox api is mean and errored
                  🔎 ..well probably because this user doesn't exist or roblox is dead rn
               `
               : null
         })
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`mod_modify-ban:${playerId}`)
               .setLabel(`modify ban`)
               .setEmoji(`📝`)
               .setStyle(Discord.ButtonStyle.Secondary)
         ])
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds,
      components
   });
};