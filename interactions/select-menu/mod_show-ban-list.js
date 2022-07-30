import Discord from "discord.js";
import dayjs from "dayjs";

import pkg from "../../package.json" assert { type: "json" };

import { emojis, colours, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * show a modal to the user for them to submit a suggestion
 * @param {Discord.SelectMenuInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // select menu info
   const [ _selectMenu, dbId, index ] = interaction.customId.split(`:`);
   const [ playerId ] = interaction.values;


   // "defer" the interaction
   if (interaction.message.components.length > 1) {
      // disable all components
      for (const actionRow of interaction.message.components)
         for (const component of actionRow.components)
            component.data.disabled = true;

      // edit the select menu to show a loading state
      interaction.message.components[0].components[0].data.options = [
         new Discord.SelectMenuOptionBuilder()
            .setLabel(`Loading...`)
            .setValue(`uwu`)
            .setEmoji(emojis.loading)
            .setDefault(true)
      ];

      // edit the page button to show a loading state
      Object.assign(interaction.message.components[1].components[2].data, {
         label: null,
         emoji: Discord.parseEmoji(emojis.loading)
      });

   } else
      // edit the back button to show a loading state
      Object.assign(interaction.message.components[0].components[0].data, {
         label: null,
         emoji: Discord.parseEmoji(emojis.loading),
         disabled: true
      });

   // update the interaction
   await interaction.update({
      components: interaction.message.components
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


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`mod_show-ban-list:${dbId}:${index}`)
               .setEmoji(`🔙`)
               .setStyle(Discord.ButtonStyle.Primary)
         ])
   ];


   // response isn't okai
   if (bannedUser?.ok === false)
      return await interaction.editReply({
         embeds: [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setDescription(strip`
                  ❌ **can't get this ban entry**
                  > ${
                     bannedUser.status === 404
                        ? `the id \`${playerId}\` wasn't found in the ban list chief` // not found
                        : `some scary error occurred with the ban list! try again later maybe`
                  }
               `)
         ],
         components
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

   const reason = bannedUser.fields.Reason?.stringValue || `\`No reason found.\``;
   const createdAtTimestamp = dayjs(bannedUser.createTime).unix();

   const displayName =     userProfile?.displayName || `???`;
   const name        = `@${userProfile?.name        || `???`}`;

   const profileURL = userProfile
      ? `https://www.roblox.com/users/${playerId}/profile`
      : null;

   const moderator = await redis.HGET(`flooded-area:ban-logs:${playerId}`, `moderator`);


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


   // edit the interaction's original reply
   return await interaction.editReply({
      embeds,
      components
   });
};