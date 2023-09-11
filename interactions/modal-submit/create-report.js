export const name = "create-report";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import { colours, emojis, set, strip } from "@magicalbunny31/awesome-utility-stuff";

import cache from "../../data/cache.js";
import pkg from "../../package.json" assert { type: "json" };

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal info
   const [ _modal, type ] = interaction.customId.split(`:`);

   const id = interaction.id;


   // "defer" the interaction
   await interaction.update({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setTitle(`📣 Report a Player`)
            .setDescription(`${emojis.loading} Your report is loading...`)
      ],
      components: []
   });


   // the user's bloxlink linked account
   const bloxlinkLinkedAccount = cache.get(`bloxlink-linked-account`)?.[interaction.user.id];


   // fields
   const typeOfReport = {
      "false-votekicking":    `False votekicking`,
      "spamming":             `Spamming`,
      "bypassing":            `Bypassing / Swearing`,
      "toxicity":             `Toxicity / Harassment`,
      "bug-abuse":            `Bug abusing`,
      "inappropriate-player": `Inappropriate player`,
      "bigotry":              `Bigotry`,
      "exploiting":           `Exploiting / Hacking`,
      "ban-evade":            `Ban evading`,
      "mod-abuse":            `Moderator abuse`,
      "other":                `Other`
   }[type];

   const reportingPlayerUsername = interaction.fields.getTextInputValue(`reporting-player`).trim();
   const reportedPlayerUsername  = interaction.fields.getTextInputValue(`reported-player`) .trim();
   const reason                  = interaction.fields.fields.find(field => field.customId === `reason`)?.value.trim();

   const reasonLabel = {
      "false-votekicking":    `WHY YOU WERE VOTEKICKED`,
      "inappropriate-player": `HOW THEY WERE BEING INAPPROPRIATE`,
      "mod-abuse":            `HOW THEY WERE ABUSING THEIR POWERS`,
      "other":                `WHY THEY'RE BEING REPORTED`
   }[type];

   const reasonRequired = [ `inappropriate-player`, `mod-abuse`, `other` ].includes(type);
   const proofRequired  = [ `spamming`, `bypassing`, `toxicity`, `bug-abuse`, `inappropriate-player`, `bigotry`, `exploiting`, `ban-evade`, `other` ].includes(type);


   // get the reporting/reported players
   const userAgent = `${pkg.name}/${pkg.version} (https://github.com/${pkg.author}/${pkg.name})`;

   const [ reportingPlayerData, reportedPlayerData ] = await (async () => {
      const response = await fetch(`https://users.roblox.com/v1/usernames/users`, {
         method: `POST`,
         headers: {
            "Accept": `application/json`,
            "Content-Type": `application/json`,
            "User-Agent": userAgent
         },
         body: JSON.stringify({
            usernames: set(
               [
                  reportingPlayerUsername,
                  reportedPlayerUsername
               ]
                  .filter(Boolean)
            )
         })
      });

      if (!response.ok)
         return null;

      const { data } = await response.json();
      return [
         data.find(player => player.name?.toLowerCase() === reportingPlayerUsername.toLowerCase()),
         data.find(player => player.name?.toLowerCase() === reportedPlayerUsername .toLowerCase())
      ];
   })();

   const formattedReportingPlayer = strip`
      ${
         reportingPlayerData && bloxlinkLinkedAccount && reportingPlayerData?.id !== bloxlinkLinkedAccount?.id
            ? `> ${
               Discord.strikethrough(
                  Discord.hyperlink(`${bloxlinkLinkedAccount.displayName} (@${bloxlinkLinkedAccount.name})`, `https://www.roblox.com/users/${bloxlinkLinkedAccount.id}/profile`)
               )
            }`
            : ``
      }
      > ${
         reportingPlayerData
            ? Discord.hyperlink(`${reportingPlayerData.displayName} (@${reportingPlayerData.name})`, `https://www.roblox.com/users/${reportingPlayerData.id}/profile`)
            : reportingPlayerUsername
               ? `@${reportingPlayerUsername} ❓`
               : `\`not set\``
      }
   `;

   const formattedReportedPlayer = reportedPlayerData
      ? `> ${Discord.hyperlink(`${reportedPlayerData.displayName} (@${reportedPlayerData.name})`, `https://www.roblox.com/users/${reportedPlayerData.id}/profile`)}`
      : reportedPlayerUsername
         ? `> @${reportedPlayerUsername} ❓`
         : `> \`not set\``;


   // set this data in the cache
   cache.set(id, {
      reportingPlayerUsername,
      reportedPlayerUsername,
      reason
   });


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(interaction.user.accentColor || (await interaction.user.fetch(true)).accentColor || colours.flooded_area)
         .setTitle(`📣 Report a Player`)
         .setFields(
            [
               {
                  name: `TYPE OF REPORT`,
                  value: `> ${typeOfReport}`,
                  inline: true
               },
               {
                  name: `YOUR ROBLOX ACCOUNT`,
                  value: formattedReportingPlayer,
                  inline: true
               },
               {
                  name: `PLAYER YOU'RE REPORTING`,
                  value: formattedReportedPlayer,
                  inline: true
               },
               ...reasonLabel
                  ? [{
                     name: reasonLabel,
                     value: `>>> ${reason || `\`not set\``}`,
                     inline: true
                  }]
                  : []
            ]
         )
         .setFooter({
            text: `Your report will not be sent until you confirm it in the next channel.`
         })
   ];


   // errors in the report data
   const invalidReport = (reasonRequired && !reason) || (!reportedPlayerUsername);

   const errors = [
      ...!invalidReport
         ? [
            ...!reportingPlayerUsername
               ? [{
                  name: `Are you sure your Roblox username isn't needed?`,
                  value: strip`
                     > - Inputting a username may help the ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} with your report.
                  `
               }]
               : !reportingPlayerData && reportingPlayerUsername
                  ? [{
                     name: `Hmm, @${reportingPlayerUsername} doesn't seem to be a Roblox account.`,
                     value: strip`
                        > - Did you type something wrong? It wouldn't hurt to correct it - it may even help the ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} with your report.
                     `
                  }]
                  : [],

            ...!reportedPlayerData && reportedPlayerUsername
               ? [{
                  name: `Hmm, @${reportedPlayerUsername} doesn't seem to be a Roblox account.`,
                  value: strip`
                     > - Did you type something wrong? It wouldn't hurt to correct it - it may even help the ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} with your report.
                     > - Or, if this is as much as you can remember, feel free to continue.
                  `
               }]
               : [],

            ...!reasonRequired && reasonLabel && !reason
               ? [{
                  name: `Are you sure you don't want to input ${
                     {
                        "false-votekicking": `why you were votekicked`
                     }[type]
                  }?`,
                  value: strip`
                     > - Any bit of information can help the ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} with your report.
                  `
               }]
               : []
         ]

         : [
            ...!reportedPlayerUsername
               ? [{
                  name: `Well, who are you reporting?!`,
                  value: strip`
                     > - It helps the ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} know exactly who you're reporting!
                     > - You can input anything, even if it's not a valid Roblox account, if you roughly remember parts of their username.
                  `
               }]
               : [],

            ...reasonRequired && !reason
               ? [{
                  name: `You must input ${
                     {
                        "inappropriate-player": `how they were being inappropriate`,
                        "mod-abuse":            `how they were abusing their powers`,
                        "other":                `why you're reporting this player`
                     }[type]
                  }.`,
                  value: strip`
                     > Without a reason, the ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} won't know why you're reporting this player.
                  `
               }]
               : []
         ]
   ];

   if (errors.length)
      embeds.push(
         new Discord.EmbedBuilder()
            .setColor(
               !invalidReport
                  ? colours.orange
                  : colours.red
            )
            .setTitle(
               !invalidReport
                  ? `\\💣 Before you send your report...`
                  : `\\💥 You can't send this report just yet.`
            )
            .setFields(errors)
      );


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`create-report-thread:${type}:${proofRequired}:${!!errors.length}`)
               .setLabel(`Continue`)
               .setEmoji(`➡️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(invalidReport),
            new Discord.ButtonBuilder()
               .setCustomId(`create-report:${type}:${id}`)
               .setLabel(`Edit report`)
               .setEmoji(`🗒️`)
               .setStyle(Discord.ButtonStyle.Secondary)
         )
   ];


   // edit the interaction's original reply
   await interaction.editReply({
      embeds,
      components
   });
};