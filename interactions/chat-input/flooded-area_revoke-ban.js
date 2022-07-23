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
   const playerId = interaction.options.getString(`player-id`);


   // defer the interaction
   await interaction.deferReply();


   // delete this banned user from the database
   const bannedUser = await (async () => {
      const response = await fetch(`${process.env.BAN_DATABASE_URL}/${playerId}`, {
         method: `DELETE`,
         headers: {
            "User-Agent": `${pkg.name} (https://github.com/magicalbunny31/discord-flooded-area-bot)`
         }
      });

      if (response.ok)
         return true;

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
            ❌ **Couldn't revoke this ban.**
            > ${
               bannedUser.status === 404
                  ? `Id \`${playerId}\` wasn't found in the list of banned users.` // not found
                  : `An error occurred trying to fetch this user, try again later.`
            }
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

   const displayName =     userProfile?.displayName || `???`;
   const name        = `@${userProfile?.name        || `???`}`;

   const profileURL = userProfile
      ? `https://www.roblox.com/users/${playerId}/profile`
      : null;


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setAuthor({
            name: `${displayName} ${name} (${playerId})`,
            iconURL: userAvatarHeadshot,
            url: profileURL
         })
         .setDescription(strip`
            ✅ **Revoked \`${userProfile?.name ? `@${userProfile?.name}` : playerId}\`'s ban.**
            > Bans are refreshed at a 30 second interval.
            > It may take a bit of time before \`${userProfile?.name ? `@${userProfile?.name}` : playerId}\`'s ban is actually revoked.
         `)
         .setFooter({
            text: robloxApiErrored
               ? strip`
                  💥 The Roblox API errored during these requests.
                  🔎 This may be because this user may not exist on Roblox or it is currently down.
               `
               : null
         })
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds
   });
};