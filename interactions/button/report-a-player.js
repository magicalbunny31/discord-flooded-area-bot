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
                  ### 🚫 Cannot open menu.
                  > - You have been blacklisted from ${interaction.channel}.
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
            > - Here, you can report other people for breaking the ${Discord.channelMention(process.env.FA_CHANNEL_RULES_AND_INFO)}.
            > - Use the select menu below to select a report reason...
         `)
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`report-a-player`)
               .setPlaceholder(`Select a reason...`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🥾`)
                     .setLabel(`False votekicking`)
                     .setDescription(`You were votekicked for an unfair reason from a server.`)
                     .setValue(`false-votekicking`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`💣`)
                     .setLabel(`Griefing`)
                     .setDescription(`Another player destroyed your build.`)
                     .setValue(`griefing`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`💬`)
                     .setLabel(`Spamming`)
                     .setDescription(`Another player is flooding the chat.`)
                     .setValue(`spamming`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`💭`)
                     .setLabel(`Bypassing / Swearing`)
                     .setDescription(`Another player is saying inappropriate words.`)
                     .setValue(`bypassing`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🗯️`)
                     .setLabel(`Toxicity / Harassment`)
                     .setDescription(`Another player is being a constant bully.`)
                     .setValue(`toxicity`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🐛`)
                     .setLabel(`Bug abusing`)
                     .setDescription(`Another player is abusing a bug for unfair advantage.`)
                     .setValue(`bug-abuse`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🪪`)
                     .setLabel(`Inappropriate player`)
                     .setDescription(`Another player is being inappropriate.`)
                     .setValue(`inappropriate-player`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`💢`)
                     .setLabel(`Bigotry`)
                     .setDescription(`Another player is being intolerant of others' opinions.`)
                     .setValue(`bigotry`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`💻`)
                     .setLabel(`Exploiting / Hacking`)
                     .setDescription(`Another player is using exploits.`)
                     .setValue(`exploiting`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`👥`)
                     .setLabel(`Ban evading`)
                     .setDescription(`A previously-banned player is evading a ban.`)
                     .setValue(`ban-evade`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🚨`)
                     .setLabel(`Moderator abuse`)
                     .setDescription(`An in-game moderator is abusing their powers.`)
                     .setValue(`mod-abuse`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`❓`)
                     .setLabel(`Other...`)
                     .setDescription(`You are reporting a player for a reason not listed here.`)
                     .setValue(`other`)
               )
         )
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds,
      components
   });
};