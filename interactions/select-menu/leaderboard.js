import Discord from "discord.js";
import { colours, emojis, strip, sum } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.AnySelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu, category, subcategory, index = 0 ] = interaction.customId.split(`:`);
   const [ value ] = interaction.values || [ ...interaction.users.values() ];


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


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setDescription(`${emojis.foxbox}${emojis.foxsleep}${emojis.foxsnug}`)
   ];


   // set the selected value(s) as default in its select menu
   const components = interaction.message.components;

   let selectMenuIndex, selectedValuesIndexes, selectedValueEmoji;

   if (interaction.isStringSelectMenu()) {
      selectMenuIndex = components.flat().findIndex(({ components }) => components[0].customId === interaction.customId);
      selectedValuesIndexes = components[selectMenuIndex].components[0].options.findIndex(option => option.value === value);

      selectedValueEmoji = components[selectMenuIndex].components[0].options[selectedValuesIndexes].emoji;

      for (const option of components[selectMenuIndex].components[0].options)
         option.default = false;

      Object.assign(components[selectMenuIndex].components[0].options[selectedValuesIndexes], {
         emoji: Discord.parseEmoji(emojis.loading),
         default: true
      });
   };


   // "defer" the interaction

   // update the message if this is the same command user as the select menu booper (or if the message is ephemeral)
   if (interaction.user.id === interaction.message.interaction?.user.id || !interaction.message.interaction) {
      const disabledComponents = components.map(actionRow =>
         actionRow.components.map(component => !component.disabled)
      );

      for (const [ actionRowIndex, disabledComponentsActionRow ] of disabledComponents.entries())
         for (const [ componentIndex, disabledComponent ] of disabledComponentsActionRow.entries())
            if (disabledComponent)
               components[actionRowIndex].components[componentIndex].data.disabled = true;

      await interaction.update({
         components
      });

      for (const [ actionRowIndex, disabledComponentsActionRow ] of disabledComponents.entries())
         for (const [ componentIndex, disabledComponent ] of disabledComponentsActionRow.entries())
            if (disabledComponent)
               components[actionRowIndex].components[componentIndex].data.disabled = false;

   } else
      // this isn't the same person who used the command: create a new reply to the interaction
      await interaction.deferReply({
         ephemeral: true
      });



   // restore the "deferred" option's emoji
   if (interaction.isStringSelectMenu())
      Object.assign(components[selectMenuIndex].components[0].options[selectedValuesIndexes], {
         emoji: selectedValueEmoji
      });


   // create the category's select menu
   switch (value) {
      case `/america`: {
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`leaderboard:/america:menu`)
                     .setPlaceholder(`select a subcategory..`)
                     .setOptions(
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`view a specific user's statistics..`)
                           .setEmoji(`🔎`)
                           .setValue(`statistics`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`overall /america count`)
                           .setEmoji(emojis.flooded_area)
                           .setValue(`overall`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`most "america"s`)
                           .setEmoji(`🇺🇸`)
                           .setValue(`america`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`most "amerwica~ nyaa~"s`)
                           .setEmoji(`🐱`)
                           .setValue(`amerwica`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`most "acirema"s`)
                           .setEmoji(`🇺🇸`)
                           .setValue(`acirema`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`most "there is no america, only flood"s`)
                           .setEmoji(`<:Flood:983391790348509194>`)
                           .setValue(`flood`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`most "super rare america™️"s`)
                           .setEmoji(`🇺🇸`)
                           .setValue(`rare`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`most "even more rarer america™️™️"s`)
                           .setEmoji(`🇺🇸`)
                           .setValue(`rarer`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`most "bri'ish"s`)
                           .setEmoji(`🇬🇧`)
                           .setValue(`british`)
                     )
               )
         );
         break;
      };

      case `/boop haiii`: {
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`leaderboard:/boop haiii:menu`)
                     .setPlaceholder(`select a subcategory..`)
                     .setOptions(
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`view a specific user's statistics..`)
                           .setEmoji(`🔎`)
                           .setValue(`statistics`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`boop haiii`)
                           .setEmoji(`🦊`)
                           .setValue(`boop haiii`)
                     )
               )
         );
         break;
      };

      case `/currency`: {
         const { "shop-items": shopItems } = (await firestore.collection(`command`).doc(`currency`).get()).data();
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`leaderboard:/currency:menu`)
                     .setPlaceholder(`select a subcategory..`)
                     .setOptions(
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`view a specific user's statistics..`)
                           .setEmoji(`🔎`)
                           .setValue(`statistics`),
                        ...shopItems
                           .filter(shopItem => !shopItem.role)
                           .map(shopItem =>
                              new Discord.StringSelectMenuOptionBuilder()
                                 .setLabel(`most "${shopItem.name}"s`)
                                 .setEmoji(shopItem.emoji)
                                 .setValue(shopItem.name)
                           )
                     )
               )
         );
         break;
      };

      case `/minesweeper`: {
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`leaderboard:/minesweeper:menu`)
                     .setPlaceholder(`select a subcategory..`)
                     .setOptions(
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`view a specific user's statistics..`)
                           .setEmoji(`🔎`)
                           .setValue(`statistics`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`most games`)
                           .setEmoji(`🎮`)
                           .setValue(`games`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`fastest time`)
                           .setEmoji(`⌚`)
                           .setValue(`time`)
                     )
               )
         );
         break;
      };

      case `/tic-tac-toe`: {
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`leaderboard:/tic-tac-toe:menu`)
                     .setPlaceholder(`select a subcategory..`)
                     .setOptions(
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`view a specific user's statistics..`)
                           .setEmoji(`🔎`)
                           .setValue(`statistics`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`most wins`)
                           .setEmoji(`🏅`)
                           .setValue(`win`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`most drew`)
                           .setEmoji(`⚔️`)
                           .setValue(`draw`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`most losses`)
                           .setEmoji(`🙌`)
                           .setValue(`lose`)
                     )
               )
         );
         break;
      };

      case `/votekick`: {
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`leaderboard:/votekick:menu`)
                     .setPlaceholder(`select a subcategory..`)
                     .setOptions(
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`view a specific user's statistics..`)
                           .setEmoji(`🔎`)
                           .setValue(`statistics`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`most votekicked`)
                           .setEmoji(`📣`)
                           .setValue(`votekick`)
                     )
               )
         );
         break;
      };

      case `/whack-a-flood`: {
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`leaderboard:/whack-a-flood:menu`)
                     .setPlaceholder(`select a subcategory..`)
                     .setOptions(
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`view a specific user's statistics..`)
                           .setEmoji(`🔎`)
                           .setValue(`statistics`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`most games`)
                           .setEmoji(`🎮`)
                           .setValue(`games`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`highest score`)
                           .setEmoji(`🏆`)
                           .setValue(`score`)
                     )
               )
         );
         break;
      };
   };


   // show statistics
   if (value === `statistics`) {
      // add a user select menu to view statistics for a specific user
      components.splice(2, 3,
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.UserSelectMenuBuilder()
                  .setCustomId(`leaderboard:${category}:statistics`)
                  .setPlaceholder(`select a member..`)
            )
      );


   } else if (subcategory === `statistics`) {
      // get these statistics
      const database = firestore.collection(`leaderboard-statistics`).doc(category.slice(1));
      const data = (await database.get()).data();
      const statistics = data?.[value];


      // embeds
      embeds.splice(0, 1,
         await (async () => {
            switch (category) {
               case `/america`:
                  return new Discord.EmbedBuilder()
                     .setColor(colours.flooded_area)
                     .setDescription(strip`
                        ${emojis.flooded_area} overall america count: \`${sum(Object.values(statistics || {})).toLocaleString()}\`
                        🇺🇸 "america": \`${statistics?.america || 0}\`
                        🐱 "amerwica~ nyaa~": \`${statistics?.amerwica || 0}\`
                        🇺🇸 "acirema": \`${statistics?.acirema || 0}\`
                        <:Flood:983391790348509194> "there is no america, only flood": \`${statistics?.flood || 0}\`
                        🇺🇸 "super rare america™️": \`${statistics?.rare || 0}\`
                        🇺🇸 "even more rarer america™️™️": \`${statistics?.rarer || 0}\`
                        🇺🇸 "bri'ish": \`${statistics?.british || 0}\`
                     `);

               case `/boop haiii`:
                  return new Discord.EmbedBuilder()
                     .setColor(colours.flooded_area)
                     .setDescription(strip`
                        🦊 boop haiii: \`${statistics || 0}\`
                     `);

               case `/currency`: {
                  const { "shop-items": shopItems } = (await firestore.collection(`command`).doc(`currency`).get()).data();
                  const { items } = (await firestore.collection(`currency`).doc(value).get()).data();
                  return new Discord.EmbedBuilder()
                     .setColor(colours.flooded_area)
                     .setDescription(
                        shopItems
                           .filter(shopItem => !shopItem.role)
                           .map(shopItem => `${shopItem.emoji} ${shopItem.name}: \`${items.filter(item => item.name === shopItem.name).length}\``)
                           .join(`\n`)
                     );
               };

               case `/minesweeper`:
                  return new Discord.EmbedBuilder()
                     .setColor(colours.flooded_area)
                     .setDescription(strip`
                        🎮 games played: \`${statistics?.length || 0}\`
                        ⌚ fastest time: \`${Math.min(...statistics?.map(({ time }) => time) || [ 0 ]) / 1000 || `no value..`}\`
                        ⌚ slowest time: \`${Math.max(...statistics?.map(({ time }) => time) || [ 0 ]) / 1000 || `no value..`}\`
                     `);

               case `/tic-tac-toe`:
                  const mostAgainst = { win: {}, draw: {}, lose: {} };
                  statistics?.filter(({ outcome }) => outcome === `win`) .forEach(game => mostAgainst.win [game.against] = (mostAgainst[game.against] || 0) + 1);
                  statistics?.filter(({ outcome }) => outcome === `draw`).forEach(game => mostAgainst.draw[game.against] = (mostAgainst[game.against] || 0) + 1);
                  statistics?.filter(({ outcome }) => outcome === `lose`).forEach(game => mostAgainst.lose[game.against] = (mostAgainst[game.against] || 0) + 1);

                  return new Discord.EmbedBuilder()
                     .setColor(colours.flooded_area)
                     .setDescription(strip`
                        🏅 wins: \`${statistics?.filter(({ outcome }) => outcome === `win`).length || 0}\`
                        👥 won most against: ${
                           Object
                              .keys(mostAgainst.win)
                              .find(key =>
                                 mostAgainst.win[key] === Math.max(...Object.values(mostAgainst.win))
                              )
                                 ? await userIsInGuild(
                                    Object
                                       .keys(mostAgainst.win)
                                       .find(key =>
                                          mostAgainst.win[key] === Math.max(...Object.values(mostAgainst.win))
                                       )
                                 )
                                       ? Discord.userMention(
                                          Object
                                             .keys(mostAgainst.win)
                                             .find(key =>
                                                mostAgainst.win[key] === Math.max(...Object.values(mostAgainst.win))
                                             )
                                       )
                                       : (await interaction.client.users.fetch(
                                          Object
                                             .keys(mostAgainst.win)
                                             .find(key =>
                                                mostAgainst.win[key] === Math.max(...Object.values(mostAgainst.win))
                                             )
                                       )).tag
                                 : `\`no value..\``
                        } \`${
                           Math.max(
                              ...Object.values(
                                 Object.values(mostAgainst.win).length ? mostAgainst.win : [ 0 ]
                              )
                           )
                           || `no value..`
                        }\`

                        ⚔️ draws: \`${statistics?.filter(({ outcome }) => outcome === `draw`).length || 0}\`
                        👥 drew most against: ${
                           Object
                              .keys(mostAgainst.draw)
                              .find(key =>
                                 mostAgainst.draw[key] === Math.max(...Object.values(mostAgainst.draw))
                              )
                                 ? await userIsInGuild(
                                    Object
                                       .keys(mostAgainst.draw)
                                       .find(key =>
                                          mostAgainst.draw[key] === Math.max(...Object.values(mostAgainst.draw))
                                       )
                                 )
                                       ? Discord.userMention(
                                          Object
                                             .keys(mostAgainst.draw)
                                             .find(key =>
                                                mostAgainst.draw[key] === Math.max(...Object.values(mostAgainst.draw))
                                             )
                                       )
                                       : (await interaction.client.users.fetch(
                                          Object
                                             .keys(mostAgainst.draw)
                                             .find(key =>
                                                mostAgainst.draw[key] === Math.max(...Object.values(mostAgainst.draw))
                                             )
                                       )).tag
                                 : `\`no value..\``
                        } \`${
                           Math.max(
                              ...Object.values(
                                 Object.values(mostAgainst.draw).length ? mostAgainst.draw : [ 0 ]
                              )
                           )
                           || `no value..`
                        }\`

                        🙌 losses:  \`${statistics?.filter(({ outcome }) => outcome === `lose`).length || 0}\`
                        👥 lost most against: ${
                           Object
                              .keys(mostAgainst.lose)
                              .find(key =>
                                 mostAgainst.lose[key] === Math.max(...Object.values(mostAgainst.lose))
                              )
                                 ? await userIsInGuild(
                                    Object
                                       .keys(mostAgainst.lose)
                                       .find(key =>
                                          mostAgainst.lose[key] === Math.max(...Object.values(mostAgainst.lose))
                                       )
                                 )
                                       ? Discord.userMention(
                                          Object
                                             .keys(mostAgainst.lose)
                                             .find(key =>
                                                mostAgainst.lose[key] === Math.max(...Object.values(mostAgainst.lose))
                                             )
                                       )
                                       : (await interaction.client.users.fetch(
                                          Object
                                             .keys(mostAgainst.lose)
                                             .find(key =>
                                                mostAgainst.lose[key] === Math.max(...Object.values(mostAgainst.lose))
                                             )
                                       )).tag
                                 : `\`no value..\``
                        } \`${
                           Math.max(
                              ...Object.values(
                                 Object.values(mostAgainst.lose).length ? mostAgainst.lose : [ 0 ]
                              )
                           )
                           || `no value..`
                        }\`
                     `);

               case `/votekick`:
                  return new Discord.EmbedBuilder()
                     .setColor(colours.flooded_area)
                     .setDescription(strip`
                        📣 votekicked: \`${statistics || 0}\`
                     `);

               case `/whack-a-flood`:
                  return new Discord.EmbedBuilder()
                     .setColor(colours.flooded_area)
                     .setDescription(strip`
                        🎮 games played: \`${statistics?.length || 0}\`
                        ⌚ highest score: \`${Math.max(...statistics?.map(({ score }) => score) || [ 0 ]) || `no value..`}\`
                        ⌚ lowest score: \`${Math.min(...statistics?.map(({ score }) => score) || [ -1 ]) !== -1 ? Math.min(...statistics?.map(({ score }) => score)) : `no value..`}\`
                     `);
            };
         })()
      );


   } else if (category.startsWith(`/`)) {
      // get these statistics
      const database = firestore.collection(`leaderboard-statistics`).doc(category.slice(1));
      const data = (await database.get()).data();


      // the array of formatted data
      let formattedData = await (async () => {
         switch (category) {
            case `/america`:
               switch (value) {
                  case `overall`:
                     return Object.entries(data)
                        .map(([ userId, userData ]) =>
                           ({
                              [userId]: sum(Object.values(userData))
                           })
                        )
                        .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);

                  default:
                     return Object.entries(data)
                        .filter(([ _userId, userData ]) => userData[value])
                        .map(([ userId, userData ]) =>
                           ({
                              [userId]: userData[value]
                           })
                        )
                        .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);
               };


            case `/boop haiii`:
               return Object.entries(data)
                  .map(([ userId, userData ]) =>
                     ({
                        [userId]: userData
                     })
                  )
                  .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);


            case `/currency`: {
               const data = await firestore.collection(`currency`).listDocuments();
               return (
                  await Promise.all(
                     data
                        .map(async document => {
                           const { items } = (await document.get()).data();
                           return items && items.filter(item => item.name === value).length
                              ? ({
                                 [document.id]: items.filter(item => item.name === value).length
                              })
                              : null;
                        })
                  )
               )
                  .filter(Boolean)
                  .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);
            };


            case `/minesweeper`:
               switch (value) {
                  case `games`:
                     return Object.entries(data)
                        .map(([ userId, userData ]) =>
                           ({
                              [userId]: userData.length
                           })
                        )
                        .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);

                  case `time`:
                     return Object.entries(data)
                        .map(([ userId, userData ]) =>
                           ({
                              [userId]: Math.min(...userData.map(({ time }) => time)) / 1000
                           })
                        )
                        .sort((a, b) => Object.values(a)[0] - Object.values(b)[0]);
               };


            case `/tic-tac-toe`:
               return Object.entries(data)
                  .map(([ userId, userData ]) =>
                     ({
                        [userId]: userData
                           .filter(({ outcome }) => outcome === value)
                           .length
                     })
                  )
                  .filter(data => Object.values(data)[0])
                  .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);


            case `/votekick`:
               return Object.entries(data)
                  .map(([ userId, userData ]) =>
                     ({
                        [userId]: userData
                     })
                  )
                  .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);


            case `/whack-a-flood`:
               switch (value) {
                  case `games`:
                     return Object.entries(data)
                        .map(([ userId, userData ]) =>
                           ({
                              [userId]: userData.length
                           })
                        )
                        .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);

                  case `score`:
                     return Object.entries(data)
                        .map(([ userId, userData ]) =>
                           ({
                              [userId]: Math.max(...userData.map(({ score }) => score))
                           })
                        )
                        .filter(data => Object.values(data)[0])
                        .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);
               };
         };
      })();


      // split the formattedData array into chunks of 15
      const size = 15;
      formattedData = Array.from(
         new Array(Math.ceil(formattedData.length / size)),
         (_element, i) => formattedData.slice(i * size, i * size + size)
      );


      // this user has an entry set
      const userHasEntry = formattedData.findIndex(formattedData => !!formattedData.find(data => Object.keys(data)[0] === interaction.user.id)) >= 0;
      const userEntryIsOnThisPage = formattedData[0]?.find(data => Object.keys(data)[0] === interaction.user.id);


      // embeds
      embeds.splice(0, 1,
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setDescription(
               (
                  await Promise.all(
                     formattedData[+index || 0]
                        ?.map(async (data, i) =>
                           `**#${i + 1}** **${
                              await userIsInGuild(Object.keys(data)[0])
                                 ? Discord.userMention(Object.keys(data)[0])
                                 : (await interaction.client.users.fetch(Object.keys(data)[0])).tag
                           }**: \`${Object.values(data)[0].toLocaleString()}\``
                        )
                     || []
                  )
               )
                  .join(`\n`)
               || `**\`no leaderboard statistics....yet\`** ${emojis.rip}`
            )
      );


      // components
      components.splice(2, 3,
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(`leaderboard:${category}:${subcategory}:${value}:${+index - 1}`)
                  .setEmoji(`⬅️`)
                  .setStyle(Discord.ButtonStyle.Primary)
                  .setDisabled(+index - 1 < 0),
               new Discord.ButtonBuilder()
                  .setCustomId(`this button shows the pages, that's it`)
                  .setLabel(`1 / ${formattedData.length || 1}`)
                  .setStyle(Discord.ButtonStyle.Secondary)
                  .setDisabled(true),
               new Discord.ButtonBuilder()
                  .setCustomId(`leaderboard:${category}:${subcategory}:${value}:${+index + 1}`)
                  .setEmoji(`➡️`)
                  .setStyle(Discord.ButtonStyle.Primary)
                  .setDisabled(!formattedData.length || +index + 1 === formattedData.length),
               new Discord.ButtonBuilder()
                  .setCustomId(`leaderboard:${category}:${subcategory}:${value}:scroll-to-user`)
                  .setLabel(`scroll to you`)
                  .setEmoji(`👤`)
                  .setStyle(Discord.ButtonStyle.Success)
                  .setDisabled(!userHasEntry || !!userEntryIsOnThisPage)
            )
      );
   };


   // edit the interaction's original reply
   return await interaction.editReply({
      embeds,
      components
   });
};