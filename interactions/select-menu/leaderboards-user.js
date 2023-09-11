export const name = "leaderboards-user";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

import Discord from "discord.js";
import dayjs from "dayjs";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

import Keyv from "keyv";
import { KeyvFile } from "keyv-file";

/**
 * @param {Discord.UserSelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu, menu, submenu ] = interaction.customId.split(`:`);
   const user = interaction.users?.first();


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


   // this file is for the UserSelectMenus
   if (!interaction.isUserSelectMenu())
      return;


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

      [process.env.GUILD_SPACED_OUT]: {
         colour: colours.spaced_out
      }
   }[interaction.guild.id];


   // the selected user is a bot
   if (user.bot)
      return await interaction.reply({
         content: `### ❌ Bots aren't part of the levelling system.`,
         ephemeral: true
      });


   // "defer" this reply
   // update the message if this is a command reply and this is the same command user as the select menu booper (or if the message is ephemeral)
   const isSameCommandUser = interaction.user.id === interaction.message.interaction?.user.id;
   const isEphemeral = interaction.message.flags.has(Discord.MessageFlags.Ephemeral);

   if (isSameCommandUser || isEphemeral) {
      // disable all components
      for (const actionRow of interaction.message.components)
         for (const component of actionRow.components)
            component.data.disabled = true;

      // embeds
      const embeds = [
         new Discord.EmbedBuilder(interaction.message.embeds[0].data)
            .setDescription(`### ${emojis.loading} Scrolling to ${user}...`)
      ];

      // set the embed to a deferred state, because UserSelectMenus can't be "deferred" the normal way
      await interaction.update({
         embeds,
         components: interaction.message.components
      });

   } else // this isn't the same person who used the command: create a new reply to the interaction
      await interaction.deferReply({
         ephemeral: true
      });


   // application commands
   const commands = await interaction.guild.commands.fetch();
   const commandLeaderboardsId = commands.find(command => command.name === `leaderboards`)?.id || 0;


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


   // what menu to view
   switch (menu) {


      // currency
      case `currency`: {
         // TODO


         switch (submenu) {


            // current balance
            default: {
               // embeds
               embeds[0]
                  .setTitle(`💰 Currency leaderboards`)
                  .setDescription(`*It's...empty in here.* ${emojis.foxsleep}`);


               // break out
               break;
            };


            // net worth
            case `net-worth`: {
               // embeds
               embeds[0]
                  .setTitle(`💰 Currency leaderboards`)
                  .setDescription(`*It's...empty in here.* ${emojis.foxsleep}`);


               // break out
               break;
            };


            // coins earned from talking
            case `total-coins-earned`: {
               // embeds
               embeds[0]
                  .setTitle(`💰 Currency leaderboards`)
                  .setDescription(`*It's...empty in here.* ${emojis.foxsleep}`);


               // break out
               break;
            };


            // total items owned
            case `items`: {
               // embeds
               embeds[0]
                  .setTitle(`💰 Currency leaderboards`)
                  .setDescription(`*It's...empty in here.* ${emojis.foxsleep}`);


               // break out
               break;
            };


         };


         // components
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
                     .setDisabled(true)
               ),

            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.UserSelectMenuBuilder()
                     .setCustomId(`leaderboards-user:currency:${submenu}:user`)
                     .setPlaceholder(`Scroll to a specific person's entry on this leaderboard...`)
                     .setDisabled(true)
               )
         );


         // break out
         break;
      };


      // levelling
      case `levels`: {
         // function to get a level from experience
         const getLevel = experience => Math.floor(Math.sqrt(experience / 10));


         // get levelling data
         const data = Object.entries(await keyv.get(interaction.guild.id));

         data.sort(([ _aKey, a ], [ _bKey, b ]) => b.experience - a.experience);


         // the selected user isn't in the data
         const userInData = data.find(([ userId ]) => userId === user.id);

         if (!userInData)
            return await interaction.editReply({
               embeds: [
                  embeds[0]
                     .setTitle(`📈 Levelling leaderboards`)
                     .setDescription(strip`
                        ### 🚫 ${user} isn't on the levelling leaderboards.
                        > - These ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`leaderboard`, commandLeaderboardsId)}s will next update ${Discord.time(dayjs().startOf(`day`).add(1, `day`).unix(), Discord.TimestampStyles.RelativeTime)}.
                     `)
               ],
               components: [
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.UserSelectMenuBuilder()
                           .setCustomId(`leaderboards-user:levels:user`)
                           .setPlaceholder(`Scroll to a specific person's entry on this leaderboard...`)
                     ),
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.ButtonBuilder()
                           .setCustomId(`leaderboards:levels:0`)
                           .setEmoji(`🔙`)
                           .setStyle(Discord.ButtonStyle.Primary)
                     )
               ]
            });


         // show the 15 entries at this index
         const size = 15;
         const entries = Array.from(
            new Array(Math.ceil(data.length / size)),
            (_element, i) => data.slice(i * size, i * size + size)
         );

         const index = entries.findIndex(entries => !!entries.find(([ userId ]) => userId === user.id));
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