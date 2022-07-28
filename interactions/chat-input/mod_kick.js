import Discord from "discord.js";

import pkg from "../../package.json" assert { type: "json" };

import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * kick a player from roblox Flooded Area
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // options
   const playerId = interaction.options.getInteger(`player-id`);
   const reason = interaction.options.getString(`reason`);


   // users and channels
   const magicalbunny31 = Discord.userMention(`490178047325110282`);


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
            ❌ **can't kick this user**
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


   // check if this user is already kicked or not
   const isKicked = await (async () => {
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


   // this user is already kicked
   if (isKicked)
      return await interaction.editReply({
         content: strip`
            ❌ **can't kick this user**
            > \`@${name}\` is already kicked
         `
      });


   // response isn't okai
   if (isKicked?.ok === false)
      return await interaction.editReply({
         content: strip`
            ❌ **can't kick this user**
            > some scary error occurred with the kick list! try again later maybe
            > give this to ${magicalbunny31}: \`${isKicked.status}\`
         `
      });


   // add this user's id to the kick database
   const kickedUser = await (async () => {
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
               Kicked: {
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
   if (kickedUser?.ok === false)
      return await interaction.editReply({
         content: strip`
            ❌ **can't kick this user**
            > some scary error occurred with the kick list! try again later maybe
            > give this to ${magicalbunny31}: \`${kickedUser.status}\`
         `
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
            🥾 **kicked \`@${name}\`!**
            > well done on doing your job

            📝 **reason**
            > ${reason}
         `)
         .setFooter({
            text: strip`
               📋 the kick list is refreshed every 15 seconds,
               🔨 so be patient if they haven't actually been kicked yet >.>
            `
         })
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds
   });
};