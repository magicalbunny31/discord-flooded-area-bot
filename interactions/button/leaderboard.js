import Discord from "discord.js";
import { colours, emojis, sum } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   let [ _button, category, subcategory, value, index ] = interaction.customId.split(`:`);


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


   // set the booped button's emoji into a deferred state
   const components = interaction.message.components;

   const actionRowIndex = components.flat().findIndex(({ components }) => components.find(component => component.customId === interaction.customId));
   const buttonIndex = components[actionRowIndex].components.findIndex(component => component.customId === interaction.customId);

   const boopedButtonEmoji = components[actionRowIndex].components[buttonIndex].emoji;

   Object.assign(components[actionRowIndex].components[buttonIndex].data, {
      emoji: Discord.parseEmoji(emojis.loading)
   });


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
   Object.assign(components[actionRowIndex].components[buttonIndex].data, {
      emoji: boopedButtonEmoji
   });


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

            switch (value) {
               case `net-worth`:
                  return (
                     await Promise.all(
                        data
                           .map(async document => {
                              const { "shop-items": shopItems } = (await firestore.collection(`command`).doc(`currency`).get()).data();
                              const { coins = 0, items = [] } = (await document.get()).data();
                              return ({
                                 [document.id]: coins + sum(
                                    items.map(item => shopItems.find(shopItem => shopItem.name === item.name)?.price || 0)
                                 )
                              });
                           })
                     )
                  )
                     .filter(Boolean)
                     .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);

               default:
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


   // scroll to the user
   if (index === `scroll-to-user`)
      index = formattedData.findIndex(formattedData => !!formattedData.find(data => Object.keys(data)[0] === interaction.user.id));


   // this user has an entry set
   const userHasEntry = formattedData.findIndex(formattedData => !!formattedData.find(data => Object.keys(data)[0] === interaction.user.id)) >= 0;
   const userEntryIsOnThisPage = formattedData[+index]?.find(data => Object.keys(data)[0] === interaction.user.id);


   // embeds
   interaction.message.embeds.splice(0, 1,
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setDescription(
            (
               await Promise.all(
                  formattedData[+index]
                     ?.map(async (data, i) =>
                        `**#${i + 1 + size * +index}** **${
                           await userIsInGuild(Object.keys(data)[0])
                              ? Discord.userMention(Object.keys(data)[0])
                              : (await interaction.client.users.fetch(Object.keys(data)[0])).tag
                        }**: \`${Object.values(data)[0].toLocaleString()}\``
                     )
                  || []
               )
            )
               .join(`\n`)
         )
   );


   // components
   interaction.message.components.splice(2, 3,
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`leaderboard:${category}:${subcategory}:${value}:${+index - 1}`)
               .setEmoji(`⬅️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(+index - 1 < 0),
            new Discord.ButtonBuilder()
               .setCustomId(`this button shows the pages, that's it`)
               .setLabel(`${+index + 1} / ${formattedData.length || 1}`)
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


   // edit the interaction's original reply
   return await interaction.editReply({
      embeds: interaction.message.embeds,
      components: interaction.message.components
   });
};