export const name = "leaderboards";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`leaderboards`)
   .setDescription(`View the currency and levelling leaderboards`)
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`menu`)
         .setDescription(`Start the menu at a specific area`)
         .setChoices({
            name: `Currency`,
            value: `currency`
         }, {
            name: `Levelling`,
            value: `levels`
         })
         .setRequired(false)
   );


import Discord from "discord.js";
import dayjs from "dayjs";
import { colours, strip, sum } from "@magicalbunny31/awesome-utility-stuff";

import Keyv from "keyv";
import { KeyvFile } from "keyv-file";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const menu = interaction.options.getString(`menu`) || `currency`;


   // function to try to fetch something or return undefined instead of throwing
   const tryOrUndefined = async promise => {
      try {
         return await promise;
      } catch {
         return undefined;
      };
   };


   // function to check if a user is in this guild
   const userIsInGuild = async userId => !!await tryOrUndefined(interaction.guild.members.fetch(userId));


   // keyv
   const keyv = new Keyv({
      store: new KeyvFile({
         filename: `./database/leaderboards/${menu}.json`
      })
   });


   // data to show
   const data = {
      [process.env.GUILD_FLOODED_AREA]: {
         colour: colours.flooded_area
      },

      [process.env.GUILD_UNIVERSE_LABORATORIES]: {
         colour: colours.spaced_out
      }
   }[interaction.guild.id];


   // defer the interaction
   await interaction.deferReply();


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(data.colour)
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`leaderboards`)
               .setPlaceholder(`View the leaderboards...`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`💰`)
                     .setLabel(`Currency`)
                     .setValue(`currency`)
                     .setDefault(menu === `currency`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`📈`)
                     .setLabel(`Levelling`)
                     .setValue(`levels`)
                     .setDefault(menu === `levels`)
               )
         )
   ];


   // what menu to start at
   switch (menu) {


      // currency
      case `currency`: {
         // get currency data
         const data = Object.entries(await keyv.get(interaction.guild.id));


         // components
         const submenu = `balance`;

         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`leaderboards:currency`)
                     .setPlaceholder(`View the currency leaderboards...`)
                     .setOptions(
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`🪙`)
                           .setLabel(`Current balance`)
                           .setValue(`balance`)
                           .setDefault(submenu === `balance`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`💰`)
                           .setLabel(`Net worth`)
                           .setValue(`net-worth`)
                           .setDefault(submenu === `net-worth`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`👛`)
                           .setLabel(`Coins earned from talking`)
                           .setValue(`total-coins-earned`)
                           .setDefault(submenu === `total-coins-earned`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`📦`)
                           .setLabel(`Total items owned`)
                           .setValue(`items`)
                           .setDefault(submenu === `items`)
                     )
               ),

            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.UserSelectMenuBuilder()
                     .setCustomId(`leaderboards-user:currency:${submenu}:user`)
                     .setPlaceholder(`Scroll to a specific person's entry on this leaderboard...`)
               )
         );


         // menus
         switch (submenu) {


            case `balance`: {
               // sort data
               data.sort(([ _aKey, a ], [ _bKey, b ]) => (b.coins || 0) - (a.coins || 0));


               // show the 15 entries at this index
               const index = 0;
               const size = 15;
               const entriesToShow = data.slice(index * size, size + (index * size));

               const page = (
                  await Promise.all(
                     entriesToShow
                        .map(async ([ userId, data ], i) => {
                           const placement = (i + 1) + (index * size);
                           const nameDisplayed = await userIsInGuild(userId)
                              ? Discord.userMention(userId)
                              : `@${Discord.escapeMarkdown((await interaction.client.users.fetch(userId)).username)}`;
                           return `${placement}. ${nameDisplayed} : \`🪙 ${(data.coins || 0).toLocaleString()} ${data.coins === 1 ? `coin` : `coins`}\``;
                        })
                  )
               )
                  .join(`\n`);


               // embeds
               embeds[0]
                  .setTitle(`💰 Currency leaderboards`)
                  .setDescription(strip`
                     ${page}

                     > Last updated ${Discord.time(dayjs().startOf(`day`).unix(), Discord.TimestampStyles.RelativeTime)}
                     > Next update ${Discord.time(dayjs().startOf(`day`).add(1, `day`).unix(), Discord.TimestampStyles.RelativeTime)}
                  `);


               // components
               const pages = Math.ceil(data.length / size);

               components.splice(3, 2,
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.ButtonBuilder()
                           .setCustomId(`leaderboards:currency:balance:${index - 1}`)
                           .setEmoji(`⬅️`)
                           .setStyle(Discord.ButtonStyle.Primary)
                           .setDisabled(index - 1 < 0),
                        new Discord.ButtonBuilder()
                           .setCustomId(`leaderboards:currency:balance:${index + 1}`)
                           .setEmoji(`➡️`)
                           .setStyle(Discord.ButtonStyle.Primary)
                           .setDisabled(index + 1 >= pages),
                        new Discord.ButtonBuilder()
                           .setCustomId(`🦊`)
                           .setLabel(`${index + 1} / ${pages}`)
                           .setStyle(Discord.ButtonStyle.Secondary)
                           .setDisabled(true)
                     )
               );


               // break out
               break;
            };


            case `net-worth`: {
               // function to get total coins
               const getTotalCoins = data =>
                  (data.coins || 0)
                     + (data.item?.price || 0)
                     + sum(data.items?.map(item => item[`bought-for`]) || [], 0)
                     + (
                        data.carrots?.[`expires-at`].seconds < dayjs().unix()
                           ? 0
                           : (data.carrots?.quantity || 0) * (data.carrots?.price || 0)
                     );


               // sort data
               data.sort(([ _aKey, a ], [ _bKey, b ]) => getTotalCoins(b) - getTotalCoins(a));


               // show the 15 entries at this index
               const index = 0;
               const size = 15;
               const entriesToShow = data.slice(index * size, size + (index * size));

               const page = (
                  await Promise.all(
                     entriesToShow
                        .map(async ([ userId, data ], i) => {
                           const placement = (i + 1) + (index * size);
                           const nameDisplayed = await userIsInGuild(userId)
                              ? Discord.userMention(userId)
                              : `@${Discord.escapeMarkdown((await interaction.client.users.fetch(userId)).username)}`;
                           return `${placement}. ${nameDisplayed} : \`🪙 ${getTotalCoins(data).toLocaleString()} ${getTotalCoins(data) === 1 ? `coin` : `coins`}\``;
                        })
                  )
               )
                  .join(`\n`);


               // embeds
               embeds[0]
                  .setTitle(`💰 Currency leaderboards`)
                  .setDescription(strip`
                     ${page}

                     > Last updated ${Discord.time(dayjs().startOf(`day`).unix(), Discord.TimestampStyles.RelativeTime)}
                     > Next update ${Discord.time(dayjs().startOf(`day`).add(1, `day`).unix(), Discord.TimestampStyles.RelativeTime)}
                  `);


               // components
               const pages = Math.ceil(data.length / size);

               components.splice(3, 2,
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.ButtonBuilder()
                           .setCustomId(`leaderboards:currency:net-worth:${index - 1}`)
                           .setEmoji(`⬅️`)
                           .setStyle(Discord.ButtonStyle.Primary)
                           .setDisabled(index - 1 < 0),
                        new Discord.ButtonBuilder()
                           .setCustomId(`leaderboards:currency:net-worth:${index + 1}`)
                           .setEmoji(`➡️`)
                           .setStyle(Discord.ButtonStyle.Primary)
                           .setDisabled(index + 1 >= pages),
                        new Discord.ButtonBuilder()
                           .setCustomId(`🦊`)
                           .setLabel(`${index + 1} / ${pages}`)
                           .setStyle(Discord.ButtonStyle.Secondary)
                           .setDisabled(true)
                     )
               );


               // break out
               break;
            };


            case `total-coins-earned`: {
               // sort data
               data.sort(([ _aKey, a ], [ _bKey, b ]) => (b[`total-coins-earned`] || 0) - (a[`total-coins-earned`] || 0));


               // show the 15 entries at this index
               const index = 0;
               const size = 15;
               const entriesToShow = data.slice(index * size, size + (index * size));

               const page = (
                  await Promise.all(
                     entriesToShow
                        .map(async ([ userId, data ], i) => {
                           const placement = (i + 1) + (index * size);
                           const nameDisplayed = await userIsInGuild(userId)
                              ? Discord.userMention(userId)
                              : `@${Discord.escapeMarkdown((await interaction.client.users.fetch(userId)).username)}`;
                           return `${placement}. ${nameDisplayed} : \`🪙 ${(data[`total-coins-earned`] || 0).toLocaleString()} ${data[`total-coins-earned`] === 1 ? `coin` : `coins`}\``;
                        })
                  )
               )
                  .join(`\n`);


               // embeds
               embeds[0]
                  .setTitle(`💰 Currency leaderboards`)
                  .setDescription(strip`
                     ${page}

                     > Last updated ${Discord.time(dayjs().startOf(`day`).unix(), Discord.TimestampStyles.RelativeTime)}
                     > Next update ${Discord.time(dayjs().startOf(`day`).add(1, `day`).unix(), Discord.TimestampStyles.RelativeTime)}
                  `);


               // components
               const pages = Math.ceil(data.length / size);

               components.splice(3, 2,
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.ButtonBuilder()
                           .setCustomId(`leaderboards:currency:total-coins-earned:${index - 1}`)
                           .setEmoji(`⬅️`)
                           .setStyle(Discord.ButtonStyle.Primary)
                           .setDisabled(index - 1 < 0),
                        new Discord.ButtonBuilder()
                           .setCustomId(`leaderboards:currency:total-coins-earned:${index + 1}`)
                           .setEmoji(`➡️`)
                           .setStyle(Discord.ButtonStyle.Primary)
                           .setDisabled(index + 1 >= pages),
                        new Discord.ButtonBuilder()
                           .setCustomId(`🦊`)
                           .setLabel(`${index + 1} / ${pages}`)
                           .setStyle(Discord.ButtonStyle.Secondary)
                           .setDisabled(true)
                     )
               );


               // break out
               break;
            };


            // total items owned
            case `items`: {
               // sort data
               data.sort(([ _aKey, a ], [ _bKey, b ]) => (b.items?.length || 0) - (a.items?.length || 0));


               // show the 15 entries at this index
               const index = 0;
               const size = 15;
               const entriesToShow = data.slice(index * size, size + (index * size));

               const page = (
                  await Promise.all(
                     entriesToShow
                        .map(async ([ userId, data ], i) => {
                           const placement = (i + 1) + (index * size);
                           const nameDisplayed = await userIsInGuild(userId)
                              ? Discord.userMention(userId)
                              : `@${Discord.escapeMarkdown((await interaction.client.users.fetch(userId)).username)}`;
                           return `${placement}. ${nameDisplayed} : \`${(data.items?.length || 0).toLocaleString()} ${data.items?.length === 1 ? `item` : `items`}\``;
                        })
                  )
               )
                  .join(`\n`);


               // embeds
               embeds[0]
                  .setTitle(`💰 Currency leaderboards`)
                  .setDescription(strip`
                     ${page}

                     > Last updated ${Discord.time(dayjs().startOf(`day`).unix(), Discord.TimestampStyles.RelativeTime)}
                     > Next update ${Discord.time(dayjs().startOf(`day`).add(1, `day`).unix(), Discord.TimestampStyles.RelativeTime)}
                  `);


               // components
               const pages = Math.ceil(data.length / size);

               components.splice(3, 2,
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.ButtonBuilder()
                           .setCustomId(`leaderboards:currency:items:${index - 1}`)
                           .setEmoji(`⬅️`)
                           .setStyle(Discord.ButtonStyle.Primary)
                           .setDisabled(index - 1 < 0),
                        new Discord.ButtonBuilder()
                           .setCustomId(`leaderboards:currency:items:${index + 1}`)
                           .setEmoji(`➡️`)
                           .setStyle(Discord.ButtonStyle.Primary)
                           .setDisabled(index + 1 >= pages),
                        new Discord.ButtonBuilder()
                           .setCustomId(`🦊`)
                           .setLabel(`${index + 1} / ${pages}`)
                           .setStyle(Discord.ButtonStyle.Secondary)
                           .setDisabled(true)
                     )
               );


               // break out
               break;
            };


         };


         // break out
         break;
      };


      // levelling
      case `levels`: {
         // function to get a level from experience
         const getLevel = experience => Math.floor(Math.sqrt(experience / 10));


         // get levelling data
         const data = Object.entries(await keyv.get(interaction.guild.id));

         data.sort(([ _aKey, a ], [ _bKey, b ]) => (b.experience || 0) - (a.experience || 0));


         // show the 15 entries at this index
         const index = 0;
         const size = 15;
         const entriesToShow = data.slice(index * size, size + (index * size));

         const page = (
            await Promise.all(
               entriesToShow
                  .map(async ([ userId, { experience }], i) => {
                     const placement = (i + 1) + (index * size);
                     const nameDisplayed = await userIsInGuild(userId)
                        ? Discord.userMention(userId)
                        : `@${Discord.escapeMarkdown((await interaction.client.users.fetch(userId)).username)}`;
                     const level = getLevel(experience);
                     return `${placement}. ${nameDisplayed} : \`Level ${level}\` / \`${experience.toLocaleString()} experience\``;
                  })
            )
         )
            .join(`\n`);


         // embeds
         embeds[0]
            .setTitle(`📈 Levelling leaderboards`)
            .setDescription(strip`
               ${page}

               > Last updated ${Discord.time(dayjs().startOf(`day`).unix(), Discord.TimestampStyles.RelativeTime)}
               > Next update ${Discord.time(dayjs().startOf(`day`).add(1, `day`).unix(), Discord.TimestampStyles.RelativeTime)}
            `);


         // components
         const pages = Math.ceil(data.length / size);

         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.UserSelectMenuBuilder()
                     .setCustomId(`leaderboards-user:levels:user`)
                     .setPlaceholder(`Scroll to a specific person's entry on this leaderboard...`)
               ),

            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.ButtonBuilder()
                     .setCustomId(`leaderboards:levels:${index - 1}`)
                     .setEmoji(`⬅️`)
                     .setStyle(Discord.ButtonStyle.Primary)
                     .setDisabled(index - 1 < 0),
                  new Discord.ButtonBuilder()
                     .setCustomId(`leaderboards:levels:${index + 1}`)
                     .setEmoji(`➡️`)
                     .setStyle(Discord.ButtonStyle.Primary)
                     .setDisabled(index + 1 >= pages),
                  new Discord.ButtonBuilder()
                     .setCustomId(`🦊`)
                     .setLabel(`${index + 1} / ${pages}`)
                     .setStyle(Discord.ButtonStyle.Secondary)
                     .setDisabled(true)
               )
         );


         // break out
         break;
      };


   };


   // edit the deferred interaction
   await interaction.editReply({
      embeds,
      components
   });
};