export const name = "View Level";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES ];

export const data = new Discord.ContextMenuCommandBuilder()
   .setType(Discord.ApplicationCommandType.User)
   .setName(`View Level`);


import Discord from "discord.js";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.UserContextMenuCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const user = interaction.targetUser;


   // function to get experience needed from a level
   const getExperienceNeeded = level => 10 * Math.pow(level, 2);


   // function to get a level from experience
   const getLevel = experience => Math.floor(Math.sqrt(experience / 10));


   // data to show
   const data = {
      [process.env.GUILD_FLOODED_AREA]: {
         colour: colours.flooded_area
      },

      [process.env.GUILD_UNIVERSE_LABORATORIES]: {
         colour: colours.spaced_out
      }
   }[interaction.guild.id];


   // emojis
   const progressBar = {
      "flooded-area": {
         empty: {
            start:  `<:progress_start_empty:1269212982638809122>`,
            middle: `<:progress_middle_empty:1269213005242040340>`,
            end:    `<:progress_end_empty:1269213048749690961>`
         },
         full: {
            start:  `<:progress_start_full:1269213066675884104>`,
            middle: `<:progress_middle_full:1269213084992667669>`,
            end:    `<:progress_end_full:1269213104680599622>`
         }
      },

      "pride": {
         empty: {
            start:  `<:progress_start_empty_pride:1269213124310073398>`,
            middle: `<:progress_middle_empty_pride:1269213140894089256>`,
            end:    `<:progress_end_empty_pride:1269213158417891378>`
         },
         full: {
            start:  `<:progress_start_full_pride:1269213172628324352>`,
            middle: `<:progress_middle_full_pride:1269213203632623691>`,
            end:    `<:progress_end_full_pride:1269213224021000245>`
         }
      },

      "trans": {
         empty: {
            start:  `<:progress_start_empty_trans:1269213245567270912>`,
            middle: `<:progress_middle_empty_trans:1269213263468564533>`,
            end:    `<:progress_end_empty_trans:1269213286692425768>`
         },
         full: {
            start:  `<:progress_start_full_trans:1269213426258022452>`,
            middle: `<:progress_middle_full_trans:1269213452438737040>`,
            end:    `<:progress_end_full_trans:1269213471417827348>`
         }
      }
   };


   // this is a bot
   if (user.bot)
      return await interaction.reply({
         content: `### ❌ Bots aren't part of the levelling system`,
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // database
   const userLevelsDocRef  = firestore.collection(`levels`).doc(interaction.guild.id).collection(`users`).doc(user.id);
   const userLevelsDocSnap = await userLevelsDocRef.get();
   const userLevelsDocData = userLevelsDocSnap.data() || {};

   const experience = userLevelsDocData.experience || 0;
   const level      = getLevel(experience);

   const selectedProgressBar = userLevelsDocData[`progress-bar`] || `flooded-area`;


   // create a bar showing the experience towards the next level
   const levelExperienceThreshold        = getExperienceNeeded(level);
   const nextLevelExperienceThreshold    = getExperienceNeeded(level + 1);

   const experienceToNextLevel           = experience - levelExperienceThreshold;
   const experienceToNextLevelPercentage = Math.round((experienceToNextLevel / (nextLevelExperienceThreshold - levelExperienceThreshold)) * 100);
   const experienceToNextLevelFraction   = Math.round(experienceToNextLevelPercentage / 10);

   let bar = ``;

   for (let i = 0; i < 10; i ++) {
      const barType = (() => {
         switch (i) {
            case 0:  return `start`;
            default: return `middle`;
            case 9:  return `end`;
         };
      })();

      if (i + 1 <= experienceToNextLevelFraction)
         bar += progressBar[selectedProgressBar].full[barType];
      else
         bar += progressBar[selectedProgressBar].empty[barType];
   };


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(user.accentColor || (await user.fetch(true)).accentColor || data.colour)
         .setAuthor({
            name: `@${user.username}`,
            iconURL: user.displayAvatarURL()
         })
         .setTitle(`🌟 Levelling statistics`)
         .setFields({
            name: `💬 Experience`,
            value: `> \`${experience.toLocaleString()} experience\``,
            inline: true
         }, {
            name: `🏅 Level`,
            value: `> \`Level ${level}\``,
            inline: true
         }, {
            name: `📈 Experience Towards Next Level`,
            value: strip`
               > \`Level ${level.toLocaleString()}\` ${bar} \`Level ${level + 1}\`
               > ${(nextLevelExperienceThreshold - experience).toLocaleString()} more experience to level up
            `
         })
         .setFooter({
            text: strip`
               ✨ You earn 1 experience for every message you send in this server, per 5 seconds.
               💭 Your experience is a metric of your messages sent over a long period of time.
            `
         })
   ];


   // components
   const components = [
      ...user.id === interaction.user.id
         ? [
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`levels-progress-bar`)
                     .setPlaceholder(`Select a progress bar...`)
                     .setOptions(
                        new Discord.StringSelectMenuOptionBuilder()
                           .setValue(`flooded-area`)
                           .setLabel(`Default`)
                           .setEmoji(emojis.flooded_area)
                           .setDefault(selectedProgressBar === `flooded-area`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setValue(`pride`)
                           .setLabel(`Progress Pride`)
                           .setEmoji(`🏳️‍🌈`)
                           .setDefault(selectedProgressBar === `pride`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setValue(`trans`)
                           .setLabel(`Transgender`)
                           .setEmoji(`🏳️‍⚧️`)
                           .setDefault(selectedProgressBar === `trans`)
                     )
               )
         ]
         : [],

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`levelling-rewards`)
               .setLabel(`Levelling rewards`)
               .setStyle(Discord.ButtonStyle.Secondary)
               .setEmoji(`📃`),
            new Discord.ButtonBuilder()
               .setCustomId(`levels-calculation`)
               .setLabel(`How are levels calculated?`)
               .setStyle(Discord.ButtonStyle.Secondary)
               .setEmoji(`❓`)
         )
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds,
      components
   });
};