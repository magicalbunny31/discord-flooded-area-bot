import Discord from "discord.js";
import dayjs from "dayjs";

import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";
import { Timestamp } from "@google-cloud/firestore";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, id, type, ...values ] = interaction.customId.split(`:`);


   // get the current report data
   const reportData = (await firestore.collection(`temporary-stuff`).doc(id).get()).data();


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setTitle(`\\📣 Report a Player`)
         .setFields(
            [
               {
                  name: `💭 Type of report`,
                  value: `> ${
                     {
                        "false-votekicking":    `False votekicking`,
                        "griefing":             `Griefing`,
                        "spamming":             `Spamming`,
                        "bypassing":            `Bypassing / Swearing`,
                        "toxicity":             `Toxicity / Harassment`,
                        "bug-abuse":            `Bug abusing`,
                        "inappropriate-player": `Inappropriate player`,
                        "bigotry":              `Bigotry`,
                        "exploiting":           `Exploiting / Hacking`,
                        "ban-evade":            `Ban evading`,
                        "other":                `Other`
                     }[reportData?.reason || values[0]]
                  }`,
                  inline: true
               },
               {
                  name: `👥 Who's being reported`,
                  value: `> ${
                     reportData?.reportedPlayer
                        ? `${Discord.hyperlink(`${reportData.reportedPlayer.displayName} (@${reportData.reportedPlayer.name})`, `https://www.roblox.com/users/${reportData.reportedPlayer.id}/profile`)}`
                        : reportData?.reportedPlayer === null
                           ? `I forgot their username`
                           : emojis.loading
                  }`,
                  inline: true
               },
               ...(reportData?.reason || values[0]) === `false-votekicking`
                  ? [{
                     name: `💬 Why they were votekicked`,
                     value: `> ${
                        reportData?.votekickReason
                           ? Discord.escapeMarkdown(reportData.votekickReason)
                           : reportData?.votekickReason === null
                              ? `I forgot the reason`
                              : emojis.loading
                     }`,
                     inline: true
                  }]
                  : [],
               ...(reportData?.reason || values[0]) === `inappropriate-player`
                  ? [{
                     name: `💬 How they were being inappropriate`,
                     value: `> ${reportData?.inappropriatePlayerReason ? Discord.escapeMarkdown(reportData.inappropriatePlayerReason) : emojis.loading}`,
                     inline: true
                  }]
                  : [],
               ...(reportData?.reason || values[0]) === `other`
                  ? [{
                     name: `📋 Why they're being reported`,
                     value: `>>> ${reportData?.otherReason ? Discord.escapeMarkdown(reportData.otherReason) : emojis.loading}`,
                     inline: true
                  }]
                  : []
            ]
         )
         .setFooter({
            text: ![ Discord.Locale.EnglishGB, Discord.Locale.EnglishUS ].includes(interaction.locale)
               ? strip`
                  "${
                     {
                        [Discord.Locale.Bulgarian]:    `Аз говоря български!`,
                        [Discord.Locale.ChineseCN]:    `我说中文！`,
                        [Discord.Locale.ChineseTW]:    `我說中文！`,
                        [Discord.Locale.Croatian]:     `Govorim hrvatski!`,
                        [Discord.Locale.Czech]:        `Mluvím česky!`,
                        [Discord.Locale.Danish]:       `Jeg taler dansk!`,
                        [Discord.Locale.Dutch]:        `Ik spreek Nederlands!`,
                        [Discord.Locale.Finnish]:      `Puhun suomea!`,
                        [Discord.Locale.French]:       `Je parle français!`,
                        [Discord.Locale.German]:       `Ich spreche Deutsch!`,
                        [Discord.Locale.Greek]:        `Μιλάω ελληνικά!`,
                        [Discord.Locale.Hindi]:        `मैं हिंदी बोलते हैं!`,
                        [Discord.Locale.Hungarian]:    `beszélek magyarul!`,
                        // [Discord.Locale.Indonesian]:   `Saya berbicara bahasa Indonesia!`, // not supported on ui yet
                        [Discord.Locale.Italian]:      `Io parlo italiano!`,
                        [Discord.Locale.Japanese]:     `私は日本語を話します！`,
                        [Discord.Locale.Korean]:       `나는 한국어를 말한다!`,
                        [Discord.Locale.Lithuanian]:   `Aš kalbu lietuviškai!`,
                        [Discord.Locale.Norwegian]:    `Jeg snakker norsk!`,
                        [Discord.Locale.Polish]:       `Ja mówie po polsku!`,
                        [Discord.Locale.PortugueseBR]: `Eu falo o português brasileiro!`,
                        [Discord.Locale.Romanian]:     `Vorbesc romaneste!`,
                        [Discord.Locale.Russian]:      `Я говорю на русском языке!`,
                        [Discord.Locale.SpanishES]:    `¡Yo hablo español!`,
                        [Discord.Locale.Swedish]:      `Jag pratar svenska!`,
                        [Discord.Locale.Thai]:         `ฉันพูดภาษาไทย!`,
                        [Discord.Locale.Turkish]:      `Ben Türkçe konuşuyorum!`,
                        [Discord.Locale.Ukrainian]:    `Я розмовляю українською!`,
                        [Discord.Locale.Vietnamese]:   `Tôi nói tiếng Việt!`
                     }[interaction.locale]
                  }"
                  I speak ${
                     {
                        [Discord.Locale.Bulgarian]:    `Bulgarian`,
                        [Discord.Locale.ChineseCN]:    `Chinese (Simplified)`,
                        [Discord.Locale.ChineseTW]:    `Chinese (Traditional)`,
                        [Discord.Locale.Croatian]:     `Croatian`,
                        [Discord.Locale.Czech]:        `Czech`,
                        [Discord.Locale.Danish]:       `Danish`,
                        [Discord.Locale.Dutch]:        `Dutch`,
                        [Discord.Locale.Finnish]:      `Finnish`,
                        [Discord.Locale.French]:       `French`,
                        [Discord.Locale.German]:       `German`,
                        [Discord.Locale.Greek]:        `Greek`,
                        [Discord.Locale.Hindi]:        `Hindi`,
                        [Discord.Locale.Hungarian]:    `Hungarian`,
                        // [Discord.Locale.Indonesian]:   `Indonesian`, // not supported on ui yet
                        [Discord.Locale.Italian]:      `Italian`,
                        [Discord.Locale.Japanese]:     `Japanese`,
                        [Discord.Locale.Korean]:       `Korean`,
                        [Discord.Locale.Lithuanian]:   `Lithuanian`,
                        [Discord.Locale.Norwegian]:    `Norwegian`,
                        [Discord.Locale.Polish]:       `Polish`,
                        [Discord.Locale.PortugueseBR]: `Brazilian Portuguese`,
                        [Discord.Locale.Romanian]:     `Romanian`,
                        [Discord.Locale.Russian]:      `Russian`,
                        [Discord.Locale.SpanishES]:    `Spanish`,
                        [Discord.Locale.Swedish]:      `Swedish`,
                        [Discord.Locale.Thai]:         `Thai`,
                        [Discord.Locale.Turkish]:      `Turkish`,
                        [Discord.Locale.Ukrainian]:    `Ukrainian`,
                        [Discord.Locale.Vietnamese]:   `Vietnamese`
                     }[interaction.locale]
                  }!
               `
               : null,
            iconURL: `attachment://${interaction.locale}.png`
         }),

      new Discord.EmbedBuilder()
         .setColor(interaction.user.accentColor || (await interaction.user.fetch()).accentColor || interaction.member.displayColor)
         .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.avatarURL({
               extension: `png`,
               size: 4096
            })
         })
         .setDescription(`${emojis.loading} Loading...`)
   ];


   // "defer" the interaction
   await interaction.update({
      embeds,
      components: [],
      files: ![ Discord.Locale.EnglishGB, Discord.Locale.EnglishUS ].includes(interaction.locale)
         ? [
            new Discord.AttachmentBuilder()
               .setFile(`./assets/flags/${interaction.locale}.png`)
         ]
         : []
   });

   embeds[1].setDescription(null);


   // roles
   const { role: moderationTeam } = (await firestore.collection(`role`).doc(`moderation-team`).get()).data();


   // create this report if it doesn't exist already
   if (!reportData)
      await firestore.collection(`temporary-stuff`).doc(id).set({
         reportingUser: interaction.user.id,
         reason: values[0],
         delete: new Timestamp(dayjs().add(1, `day`).unix(), 0)
      });


   // this user speaks another language
   // TODO
   // if (![ Discord.Locale.EnglishGB, Discord.Locale.EnglishUS ].includes(interaction.locale))
   //    return await interaction.editReply({
   //       embeds: [
   //          embeds[0],
   //          new Discord.EmbedBuilder(embeds[1].data)
   //             .setColor(colours.red)
   //             .setDescription(null)
   //             .setFields({ // translate this lol
   //                name: `💭 It's nice you can speak English, however..`,
   //                value: strip`
   //                   > The ${Discord.roleMention(moderationTeam)}'s official language here is English.
   //                   > Please excuse us if we're slow with your report: we have to translate first!
   //                `
   //             })
   //       ],
   //       components: [

   //       ]
   //    });


   // if proof is needed for this report reason
   const proofNeeded = ![ `false-votekicking` ].includes(reportData?.reason || values[0]);


   // user-agent string for requests
   const userAgent = `discord-area-communities-bot (https://github.com/magicalbunny31/discord-area-communities-bot)`;


   switch (type) {


      // the reporting player's account
      case `reporting-player`: {
         // the reporting player's account
         const reportingPlayer = await (async () => {
            // get this player's linked roblox account on bloxlink, or a previously-inputted id
            const playerId = await (async () => {
               if (!isNaN(+values[1]))
                  return +values[1];

               const response = await fetch(`https://v3.blox.link/developer/discord/${interaction.user.id}?guildId=${interaction.guild.id}`, {
                  headers: {
                     "api-key": process.env.BLOXLINK_API_KEY,
                     "Content-Type": `application/json`,
                     "User-Agent": userAgent
                  }
               });

               if (!response.ok)
                  return null;

               const data = await response.json();

               if (!data.success)
                  return null;

               return data.user?.primaryAccount;
            })();


            // bloxlink api failed, stop here and leave them to input a user themselves
            if (!playerId)
               return null;


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


            // set their bloxlink linked account, if there is no second value (only one value is present for the bloxlink linked account)
            if (values.length === 1)
               await firestore.collection(`temporary-stuff`).doc(id).update({
                  bloxlinkLinkedAccount: player
                     ? {
                        displayName: player.displayName || player.name,
                        name: player.name,
                        id: player.id
                     }
                     : null
               });


            // return the player
            return player;
         })();


         // ask for their roblox account
         embeds[1].spliceFields(1, 1,
            reportingPlayer
               ? {
                  name: `👤 Is this your Roblox account?`,
                  value: `> ${Discord.hyperlink(`${reportingPlayer.displayName} (@${reportingPlayer.name})`, `https://www.roblox.com/users/${reportingPlayer.id}/profile`)}`
               }
               : {
                  name: `👤 What is your Roblox account?`,
                  value: `> ${emojis.loading}`
               }
         );

         return await interaction.editReply({
            embeds,
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     ...reportingPlayer
                        ? [
                           new Discord.ButtonBuilder()
                              .setCustomId(`create-report:${id}:confirm-reporting-player:${reportingPlayer.id}`)
                              .setLabel(`Yes`)
                              .setEmoji(`✅`)
                              .setStyle(Discord.ButtonStyle.Success),
                           new Discord.ButtonBuilder()
                              .setCustomId(`prompt-reporting-player:${id}:${reportingPlayer.name}`)
                              .setLabel(`No`)
                              .setEmoji(`❌`)
                              .setStyle(Discord.ButtonStyle.Danger)
                        ]
                        : [
                           new Discord.ButtonBuilder()
                              .setCustomId(`prompt-reporting-player:${id}`)
                              .setLabel(`Input player...`)
                              .setEmoji(`👤`)
                              .setStyle(Discord.ButtonStyle.Primary),
                           new Discord.ButtonBuilder()
                              .setCustomId(`create-report:${id}:confirm-reporting-player`)
                              .setLabel(`Confirm player`)
                              .setEmoji(`✅`)
                              .setStyle(Discord.ButtonStyle.Success)
                              .setDisabled(true)
                        ],
                     new Discord.ButtonBuilder()
                        .setCustomId(`create-report:${id}:no-input-reporting-player`)
                        .setLabel(`It is not needed`)
                        .setEmoji(`➡️`)
                        .setStyle(Discord.ButtonStyle.Secondary)
                  )
            ]
         });
      };


      // no input for the reporting player
      case `no-input-reporting-player`: {
         // confirm that they don't want to their account
         embeds[1]
            .setColor(colours.red)
            .spliceFields(1, 1, {
               name: `👤 Are you sure your Roblox username is not needed?`,
               value: strip`
                  > Inputting a username may help the ${Discord.roleMention(moderationTeam)} with your report.
               `
            });

         return await interaction.editReply({
            embeds,
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.ButtonBuilder()
                        .setCustomId(`create-report:${id}:confirm-reporting-player`)
                        .setLabel(`I am sure!`)
                        .setEmoji(`✅`)
                        .setStyle(Discord.ButtonStyle.Success),
                     new Discord.ButtonBuilder()
                        .setCustomId(`create-report:${id}:reporting-player:${reportData.reason}:${values[0] || ``}`)
                        .setLabel(`Go back`)
                        .setEmoji(`🔙`)
                        .setStyle(Discord.ButtonStyle.Secondary)
                  )
            ]
         });
      };


      // confirm the reporting player's account
      case `confirm-reporting-player`: {
         // get this player's roblox account
         const player = await (async () => {
            const response = await fetch(`https://users.roblox.com/v1/users/${values[0]}`, {
               headers: {
                  "Content-Type": `application/json`,
                  "User-Agent": userAgent
               }
            });

            if (!response.ok)
               return null;

            return await response.json();
         })();


         // add this to the database
         await firestore.collection(`temporary-stuff`).doc(id).update({
            reportingPlayer: values[0]
               ? {
                  displayName: player.displayName,
                  name: player.name,
                  id: player.id
               }
               : null
         });


         // breakthrough:
      };


      // the reported player's account
      case `prompt-reported-player`: {
         // ask who they're reporting
         embeds[1].spliceFields(1, 1, {
            name: `👥 ${
               {
                  "false-votekicking":    `Who votekicked you?`,
                  "griefing":             `Who griefed you?`,
                  "spamming":             `Who is spamming?`,
                  "bypassing":            `Who bypassed / swore?`,
                  "toxicity":             `Who is being toxic / harassing others?`,
                  "bug-abuse":            `Who is abusing bugs?`,
                  "inappropriate-player": `Who is being inappropriate?`,
                  "bigotry":              `Who is being mean?`,
                  "exploiting":           `Who is exploiting / hacking?`,
                  "ban-evade":            `Who is ban evading?`,
                  "other":                `Who are you reporting?`
               }[reportData.reason]
            }`,
            value: `> ${emojis.loading}`
         });

         return await interaction.editReply({
            embeds,
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.ButtonBuilder()
                        .setCustomId(`prompt-reported-player:${id}:${reportData.reason}`)
                        .setLabel(`Input player...`)
                        .setEmoji(`👥`)
                        .setStyle(Discord.ButtonStyle.Primary),
                     new Discord.ButtonBuilder()
                        .setCustomId(`create-report:${id}:confirm-reported-player:${reportData.reportedPlayer}`)
                        .setLabel(`Confirm player`)
                        .setEmoji(`✅`)
                        .setStyle(Discord.ButtonStyle.Success)
                        .setDisabled(true),
                     new Discord.ButtonBuilder()
                        .setCustomId(`create-report:${id}:no-input-reported-player`)
                        .setLabel(`I forgot their username`)
                        .setEmoji(`➡️`)
                        .setStyle(Discord.ButtonStyle.Secondary)
                  )
            ]
         });
      };


      // no input for the reporting player
      case `no-input-reported-player`: {
         // confirm that they forgot the account
         embeds[1]
            .setColor(colours.red)
            .spliceFields(1, 1, {
               name: `👥 Are you sure you forgot their username?`,
               value: strip`
                  > It helps the ${Discord.roleMention(moderationTeam)} know exactly who you're reporting!
                  > If you roughly remember a part of their username or display name, you can input it when you create the ticket.
               `
            });

         return await interaction.editReply({
            embeds,
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.ButtonBuilder()
                        .setCustomId(`create-report:${id}:confirm-reported-player`)
                        .setLabel(`I am sure!`)
                        .setEmoji(`✅`)
                        .setStyle(Discord.ButtonStyle.Success),
                     new Discord.ButtonBuilder()
                        .setCustomId(`create-report:${id}:prompt-reported-player`)
                        .setLabel(`Go back`)
                        .setEmoji(`🔙`)
                        .setStyle(Discord.ButtonStyle.Secondary)
                  )
            ]
         });
      };


      // confirm the reported player's account
      case `confirm-reported-player`: {
         // get this player's roblox account
         const player = await (async () => {
            const response = await fetch(`https://users.roblox.com/v1/users/${values[0]}`, {
               headers: {
                  "Content-Type": `application/json`,
                  "User-Agent": userAgent
               }
            });

            if (!response.ok)
               return null;

            return await response.json();
         })();


         // add this to the database
         await firestore.collection(`temporary-stuff`).doc(id).update({
            reportedPlayer: values[0]
               ? {
                  displayName: player.displayName,
                  name: player.name,
                  id: player.id
               }
               : null
         });


         // update the embed
         embeds[0].spliceFields(1, 1, {
            name: `👥 Who's being reported`,
            value: `> ${values[0] ? Discord.hyperlink(`${player.displayName} (@${player.name})`, `https://www.roblox.com/users/${player.id}/profile`) : `I forgot their username`}`,
            inline: true
         });


         // breakthrough:
      };


      // other fields that require input
      case `prompt-input`: {
         if (reportData.reason === `false-votekicking`) {
            // ask why they were votekicked
            embeds[1].spliceFields(1, 1, {
               name: `💬 Why were you votekicked?`,
               value: `> ${emojis.loading}`
            });

            return await interaction.editReply({
               embeds,
               components: [
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.ButtonBuilder()
                           .setCustomId(`prompt-votekick-reason:${id}`)
                           .setLabel(`Input reason...`)
                           .setEmoji(`📝`)
                           .setStyle(Discord.ButtonStyle.Primary),
                        new Discord.ButtonBuilder()
                           .setCustomId(`create-report:${id}:confirm-input`)
                           .setLabel(`Confirm reason`)
                           .setEmoji(`✅`)
                           .setStyle(Discord.ButtonStyle.Success)
                           .setDisabled(true),
                        new Discord.ButtonBuilder()
                           .setCustomId(`create-report:${id}:no-input:${values[0]}`)
                           .setLabel(`I forgot the reason`)
                           .setEmoji(`➡️`)
                           .setStyle(Discord.ButtonStyle.Secondary)
                     )
               ]
            });


         } else if (reportData.reason === `inappropriate-player`) {
            // ask how they were being inappropriate
            embeds[1].spliceFields(1, 1, {
               name: `💬 How were they being inappropriate?`,
               value: `> ${emojis.loading}`
            });

            return await interaction.editReply({
               embeds,
               components: [
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.StringSelectMenuBuilder()
                           .setCustomId(`inappropriate-reason:${id}`)
                           .setPlaceholder(`📝 Select a reason...`)
                           .setOptions(
                              new Discord.StringSelectMenuOptionBuilder()
                                 .setLabel(`Their avatar is inappropriate`)
                                 .setValue(`avatar`)
                                 .setEmoji(`👕`),
                              new Discord.StringSelectMenuOptionBuilder()
                                 .setLabel(`They built something inappropriate`)
                                 .setValue(`build`)
                                 .setEmoji(`🧱`),
                              new Discord.StringSelectMenuOptionBuilder()
                                 .setLabel(`They said something inappropriate`)
                                 .setValue(`chat`)
                                 .setEmoji(`🗯️`),
                              new Discord.StringSelectMenuOptionBuilder()
                                 .setLabel(`Other...`)
                                 .setValue(`other`)
                                 .setEmoji(`❓`)
                           )
                     ),
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.ButtonBuilder()
                           .setCustomId(`create-report:${id}:confirm-input`)
                           .setLabel(`Confirm reason`)
                           .setEmoji(`✅`)
                           .setStyle(Discord.ButtonStyle.Success)
                           .setDisabled(true)
                     )
               ]
            });


         } else if (reportData.reason === `other`) {
            // ask why they're being reported
            embeds[1].spliceFields(1, 1, {
               name: `📋 Why are you reporting them?`,
               value: `> ${emojis.loading}`
            });

            return await interaction.editReply({
               embeds,
               components: [
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.ButtonBuilder()
                           .setCustomId(`prompt-other-reason:${id}`)
                           .setLabel(`Input reason...`)
                           .setEmoji(`📝`)
                           .setStyle(Discord.ButtonStyle.Primary),
                        new Discord.ButtonBuilder()
                           .setCustomId(`create-report:${id}:confirm-input`)
                           .setLabel(`Confirm reason`)
                           .setEmoji(`✅`)
                           .setStyle(Discord.ButtonStyle.Success)
                           .setDisabled(true)
                     )
               ]
            });


         };
      };


      // no input from the inputs above
      case `no-input`: {
         if (reportData.reason === `false-votekicking`) {
            // confirm that they forgot the reason
            embeds[1]
               .setColor(colours.red)
               .spliceFields(1, 1, {
                  name: `💬 Are you sure you forgot the reason?`,
                  value: strip`
                     > It helps the ${Discord.roleMention(moderationTeam)} know how you got votekicked!
                     > If you have a screenshot or other evidence, feel free to send them in the ticket instead.
                  `
               });

            return await interaction.editReply({
               embeds,
               components: [
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.ButtonBuilder()
                           .setCustomId(`create-report:${id}:confirm-input`)
                           .setLabel(`I am sure!`)
                           .setEmoji(`✅`)
                           .setStyle(Discord.ButtonStyle.Success),
                        new Discord.ButtonBuilder()
                           .setCustomId(`create-report:${id}:prompt-input:${values[0]}`)
                           .setLabel(`Go back`)
                           .setEmoji(`🔙`)
                           .setStyle(Discord.ButtonStyle.Secondary)
                     )
               ]
            });


         } else if (reportData.reason === `other`) {
            // input required
            embeds[1]
               .setColor(colours.red)
               .spliceFields(1, 1, {
                  name: `❌ You must input a reason`,
                  value: strip`
                     > Without a reason, the ${Discord.roleMention(moderationTeam)} will not know why you are reporting this player.
                  `
               });

            return await interaction.editReply({
               embeds,
               components: [
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.ButtonBuilder()
                           .setCustomId(`create-report:${id}:prompt-input:${values[0]}`)
                           .setLabel(`Go back`)
                           .setEmoji(`🔙`)
                           .setStyle(Discord.ButtonStyle.Secondary)
                     )
               ]
            });


         };
      };


      // confirmation of inputs from above
      case `confirm-input`: {
         // get the value
         const { value } = (await firestore.collection(`temporary-stuff`).doc(values[0] || `zzz`).get()).data() || {}; // path strings can't be empty


         if (reportData.reason === `false-votekicking`) {
            // add this to the database
            await firestore.collection(`temporary-stuff`).doc(id).update({
               votekickReason: value || null
            });


            // update the embed
            embeds[0].spliceFields(2, 1, {
               name: `💬 Why they were votekicked`,
               value: `> ${value ? Discord.escapeMarkdown(value) : `I forgot the reason`}`,
               inline: true
            });


         } else if (reportData.reason === `inappropriate-player`) {
            // add this to the database
            await firestore.collection(`temporary-stuff`).doc(id).update({
               inappropriatePlayerReason: values[0]
            });


            // update the embed
            embeds[0].spliceFields(2, 1, {
               name: `💬 How they were being inappropriate`,
               value: `> ${
                  {
                     "avatar": `Their avatar is inappropriate`,
                     "build":  `They built something inappropriate`,
                     "chat":   `They said something inappropriate`,
                     "other":  `Other...`
                  }[values[0]]
               }`,
               inline: true
            });


         } else if (reportData.reason === `other`) {
            // add this to the database
            await firestore.collection(`temporary-stuff`).doc(id).update({
               otherReason: value
            });


            // update the embed
            embeds[0].spliceFields(2, 1, {
               name: `📋 Why they're being reported`,
               value: `>>> ${Discord.escapeMarkdown(value)}`,
               inline: true
            });


         };
      };


   };


   // create the ticket!
   embeds[1].setDescription(`${emojis.loading} Creating your ticket...`);

   await interaction.editReply({
      embeds,
      components: []
   });


   // actually create the ticket (thread)
   const thread = await interaction.channel.threads.create({
      name: `🎫┃unopened ticket`,
      type: Discord.ChannelType.PrivateThread,
      invitable: false
   });

   await thread.members.add(interaction.user);

   const reportMessage = await thread.send({
      embeds: [
         new Discord.EmbedBuilder(embeds[0].data)
            .spliceFields(1, 0, {
               name: `👤 Their account`,
               value: reportData.bloxlinkLinkedAccount && reportData.bloxlinkLinkedAccount.id !== reportData.reportingPlayer?.id
                  ? strip`
                     > ~~${Discord.hyperlink(`${reportData.bloxlinkLinkedAccount.displayName} (@${reportData.bloxlinkLinkedAccount.name})`, `https://www.roblox.com/users/${reportData.bloxlinkLinkedAccount.id}/profile`)}~~
                     > ${
                        reportData.reportingPlayer
                           ? Discord.hyperlink(`${reportData.reportingPlayer.displayName} (@${reportData.reportingPlayer.name})`, `https://www.roblox.com/users/${reportData.reportingPlayer.id}/profile`)
                           : `It is not needed`
                     }
                  `
                  : `> ${
                     reportData.reportingPlayer
                        ? Discord.hyperlink(`${reportData.reportingPlayer.displayName} (@${reportData.reportingPlayer.name})`, `https://www.roblox.com/users/${reportData.reportingPlayer.id}/profile`)
                        : `It is not needed`
                  }`,
               inline: true
            }),
         new Discord.EmbedBuilder()
            .setColor(interaction.user.accentColor || (await interaction.user.fetch()).accentColor || interaction.member.displayColor)
            .setAuthor({
               name: interaction.user.username,
               iconURL: interaction.user.avatarURL({
                  extension: `png`,
                  size: 4096
               })
            })
            .addFields({
               name: `💭 Any final things?`,
               value: strip`
                  > ${
                     proofNeeded
                        ? `You'll need to send at least 1 image/video as evidence in this thread before you can open the ticket.`
                        : `Send any other information or further evidence in this thread.`
                  }
                  > Once you're ready, open the ticket using the buttons below!
                  > Changed your mind? You can also delete the ticket below, too.
                  > This ticket will auto-close ${Discord.time(dayjs(thread.createdAt).startOf(`hour`).add(1, `hour`).add(1, `day`).unix(), Discord.TimestampStyles.RelativeTime)} if not opened.
               `
            })
      ],
      components: [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(`open-ticket:${proofNeeded}`)
                  .setLabel(`Open ticket`)
                  .setEmoji(`📬`)
                  .setStyle(Discord.ButtonStyle.Success),
               new Discord.ButtonBuilder()
                  .setCustomId(`close-ticket:true`) // 2nd arg: abandon (let the reporting player close + don't log ticket)
                  .setLabel(`Abandon ticket`)
                  .setEmoji(`💣`)
                  .setStyle(Discord.ButtonStyle.Danger)
            )
      ]
   });


   // ask the user to also send a screenshot of the debug info
   const { id: debug } = await reportMessage.reply({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .addFields({
               name: `💻 Please send your debug info, too!`,
               value: strip`
                  > Take a screenshot of the information displayed: below is an example.
                  > This helps the ${Discord.roleMention(moderationTeam)} join your server, in case they need to.
                  > It can be found at \`Settings\` ➡️ \`Other\` ➡️ \`"Click to show debug info"\`.
               `
            })
            .setImage(`attachment://debug.png`)
      ],
      files: [
         new Discord.AttachmentBuilder()
            .setFile(`./assets/report-a-player/debug.png`)
            .setDescription(`The debug info, showing: server version, server location and server id.`)
      ]
   });


   // set this in the database
   const newReportData = (await firestore.collection(`temporary-stuff`).doc(id).get()).data();
   delete newReportData.delete;

   await firestore.collection(`report-a-player`).doc(thread.id).set({
      ...newReportData,
      deleteMessagesOnOpen: [
         debug
      ]
   });


   // edit the embed to show that a ticket was created
   embeds[1].setDescription(strip`
      🎫 ${thread} created!
      📩 You can turn on your DMs to receive updates about your ticket.
   `);

   return await interaction.editReply({
      embeds,
      components: []
   });
};