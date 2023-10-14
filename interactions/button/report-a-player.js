export const name = "report-a-player";
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
      const userAgent = `${pkg.name}/${pkg.version} (https://nuzzles.dev/area-communities-bot)`;

      const playerId = await (async () => {
         const response = await fetch(`https://api.blox.link/v4/public/guilds/${interaction.guild.id}/discord-to-roblox/${interaction.user.id}`, {
            headers: {
               "Accept":        `application/json`,
               "Authorization": process.env[`BLOXLINK_SERVER_KEY_${interaction.guild.id}`],
               "User-Agent":    userAgent
            }
         });

         if (!response.ok)
            return null;

         const data = await response.json();
         return data.robloxID;
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
            displayName: player?.displayName || player?.name || null,
            name: player?.name,
            id: player?.id
         };
         cache.set(`bloxlink-linked-account`, bloxlinkLinkedAccounts);
      };
   };


   // this user is blacklisted
   if (interaction.member.roles.cache.has(process.env.FA_ROLE_REPORT_A_PLAYER_BANNED))
      return await interaction.editReply({
         embeds: [
            new Discord.EmbedBuilder()
               .setColor(colours.red)
               .setDescription(strip`
                  ### 🚫 Can't open menu
                  > - You've been blacklisted from ${interaction.channel}.
                  > - If you believe this is in error, contact a member of the ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)}.
               `)
         ],
         components: []
      });


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setTitle(`📣 Report a Player`)
         .setDescription(strip`
            ### ${emojis.bun_paw_wave} ${choice([ `Hello`, `Hi`, `Welcome` ])}, ${interaction.user}!
            > - If you find anyone who is breaking our ${Discord.channelMention(process.env.FA_CHANNEL_RULES_AND_INFO)} in ${Discord.hyperlink(`Flooded Area`, `https://www.roblox.com/games/3976767347/Flooded-Area`)}, you can report them to us here.
            > - You can also ${Discord.hyperlink(`report players to Roblox`, `https://en.help.roblox.com/hc/en-us/articles/203312410-How-to-Report-Rule-Violations`)} too, if you think it's necessary.
            > - Remember that you can always ${Discord.hyperlink(`block`, `https://en.help.roblox.com/hc/en-us/articles/203314270-How-to-Block-Another-User`)} or ${Discord.hyperlink(`mute`, `https://alvarotrigo.com/blog/mute-someone-roblox`)} any players that you don't want to interact with in chat.
         `)
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`report-a-player:0`)
               .setPlaceholder(`Select an option that best describes what you are reporting someone for.`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`During a round`)
                     .setEmoji(`🎮`)
                     .setValue(`during-round`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Chat`)
                     .setEmoji(`💬`)
                     .setValue(`chat`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Player`)
                     .setEmoji(`👤`)
                     .setValue(`player`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Something else`)
                     .setEmoji(`📝`)
                     .setValue(`something-else`)
               )
         )
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds,
      components
   });
};