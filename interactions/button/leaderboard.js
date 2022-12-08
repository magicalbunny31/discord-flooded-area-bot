import Discord from "discord.js";
import { colours, emojis, sum } from "@magicalbunny31/awesome-utility-stuff";

/**
 * show the reaction roles
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


   // "defer" the interaction
   const disabledComponents = interaction.message.components.map(actionRow =>
      actionRow.components.map(component => !component.disabled)
   );

   for (const [ actionRowIndex, disabledComponentsActionRow ] of disabledComponents.entries())
      for (const [ componentIndex, disabledComponent ] of disabledComponentsActionRow.entries())
         if (disabledComponent)
            interaction.message.components[actionRowIndex].components[componentIndex].data.disabled = true;

   await interaction.update({
      content: emojis.loading,
      components: interaction.message.components
   });

   for (const [ actionRowIndex, disabledComponentsActionRow ] of disabledComponents.entries())
      for (const [ componentIndex, disabledComponent ] of disabledComponentsActionRow.entries())
         if (disabledComponent)
            interaction.message.components[actionRowIndex].components[componentIndex].data.disabled = false;


   // get these statistics
   const database = firestore.collection(`leaderboard-statistics`).doc(category.slice(1));
   const data = (await database.get()).data();


   // the array of formatted data
   let formattedData = (() => {
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
                           [userId]: Math.max(...userData.map(({ time }) => time)) / 1000
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
      content: null,
      embeds: interaction.message.embeds,
      components: interaction.message.components
   });
};