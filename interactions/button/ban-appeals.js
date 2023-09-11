export const name = "ban-appeals";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import { colours, emojis, choice, strip } from "@magicalbunny31/awesome-utility-stuff";

import cache from "../../data/cache.js";
import pkg from "../../package.json" assert { type: "json" };

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button ] = interaction.customId.split(`:`);


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // set this user's bloxlink linked account in the cache
   if (!cache.get(`bloxlink-linked-account`)?.[interaction.user.id]) {
      const userAgent = `${pkg.name}/${pkg.version} (https://github.com/${pkg.author}/${pkg.name})`;

      const playerId = await (async () => {
         const response = await fetch(`https://v3.blox.link/developer/discord/${interaction.user.id}?guildId=${interaction.guild.id}`, {
            headers: {
               "api-key":      process.env.BLOXLINK_API_KEY,
               "Content-Type": `application/json`,
               "User-Agent":   userAgent
            }
         });

         if (!response.ok)
            return null;

         const data = await response.json();

         if (!data.success)
            return null;

         return data.user?.primaryAccount;
      })();

      // get this player's roblox account
      const player = await (async () => {
         const response = await fetch(`https://users.roblox.com/v1/users/${playerId}`, {
            headers: {
               "Content-Type": `application/json`,
               "User-Agent": userAgent
            }
         });

         if (!response.ok)
            return null;

         return await response.json();
      })();

      if (player) {
         const bloxlinkLinkedAccounts = cache.get(`bloxlink-linked-account`) || {};
         bloxlinkLinkedAccounts[interaction.user.id] = {
            displayName: player.displayName || player.name,
            name: player.name,
            id: player.id
         };
         cache.set(`bloxlink-linked-account`, bloxlinkLinkedAccounts);
      };
   };


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setTitle(`🔨 Ban Appeals`)
         .setDescription(strip`
            ### ${emojis.bun_paw_wave} ${choice([ `Hello`, `Hi`, `Welcome` ])}, ${interaction.user}!
            > - Here, you can appeal a ban that you've received in-game.
            >  - Generally, we'll will only accept appeals if you believe you were banned in error.
            >  - This includes bans where you believe there was no proof for.
            > - Before creating an appeal, you should read the ${Discord.channelMention(process.env.FA_CHANNEL_RULES_AND_INFO)} to understand our rules.
         `)
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`create-appeal`)
               .setLabel(`Create appeal`)
               .setEmoji(`🗒️`)
               .setStyle(Discord.ButtonStyle.Success)
         )
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds,
      components
   });
};