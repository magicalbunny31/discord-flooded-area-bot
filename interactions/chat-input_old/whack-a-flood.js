export const data = new Discord.SlashCommandBuilder()
   .setName(`whack-a-flood`)
   .setDescription(`🌊 FLOOD!!!!!!!!! WHACK IT !!!!`);


import Discord from "discord.js";
import dayjs from "dayjs";

import { colours, emojis, autoArray, createCollectorExpirationTime, number, strip, wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // emojis
   const flood = `<:Flood:983391790348509194>`;
   const zamn  = `<:ZAMN:1012345318131642378>`;


   // reply to the interaction
   const startAt = dayjs().add(5, `seconds`).unix();

   await interaction.reply({
      content: strip`
         ${flood} **press the corresponding buttons below to whack the flood!!**
         > the game ends once the entire area has been flooded~
         > get ready! the game starts ${Discord.time(dayjs().unix() + (startAt - dayjs().unix()) + 1, Discord.TimestampStyles.RelativeTime)}.. ${emojis.fancy_typing}
      `
   });


   // wait the 5 seconds
   await wait((startAt - dayjs().unix()) * 1000);


   // the score for this game
   let score = 0;


   // the board
   const board = autoArray(25, () => zamn);


   // function to add a flood to the board
   const addFlood = amount => {
      const loop = () => {
         const id = number(0, 24);

         if (board[id] === flood)
            return loop();

         else return id;
      };

      for (let i = 0; i < amount; i ++) {
         board.splice(loop(), 1, flood);
      };
   };

   addFlood(1);


   // function to get the indexes of spaces that have been flooded
   const getFloods = () => {
      const indexes = [];
      for (let i = 0; i < board.length; i ++) {
         const space = board[i];
         if (space === flood)
            indexes.push(i);
      };

      return indexes;
   };


   // function to create components
   const getComponents = isDisabled => {
      // array of components
      let components = [];

      // function to create a button
      const createButton = (index, emoji) =>
         new Discord.ButtonBuilder()
            .setCustomId(`${interaction.id}:${index}`)
            .setEmoji(emoji)
            .setStyle(
               !board.includes(zamn)
                  ? Discord.ButtonStyle.Secondary
                  : emoji === `✅`
                     ? Discord.ButtonStyle.Success
                     : emoji === `❌`
                        ? Discord.ButtonStyle.Danger
                        : Discord.ButtonStyle.Primary
            )
            .setDisabled(
               [ `✅`, `❌` ].includes(emoji)
                  ? true
                  : isDisabled
            );

      // create the board
      for (const [ index, emoji ] of board.entries()) {
         const button = createButton(index, emoji);
         components.push(button);
      };

      // split the components in chunks of 5
      for (let i = 0; i < components.length; i ++) {
         components.splice(i, 5, components.slice(i, i + 5));
      };

      // return the components, mapped to an action row
      return components
         .map(components =>
            new Discord.ActionRowBuilder()
               .setComponents(components)
         );
   };


   // edit the interaction's original reply
   await interaction.editReply({
      content: `> ${interaction.user}'s score: \`${score}\``,
      components: getComponents(false),
      allowedMentions: {
         parse: []
      }
   });


   // create an InteractionCollector
   const whack = interaction.channel.createMessageComponentCollector({
      filter: i => i.customId.startsWith(interaction.id),
      time: createCollectorExpirationTime(interaction.createdTimestamp)
   });


   // the interval for flooding the board
   let totalRuns  = 0;
   let hasEnded   = false;
   let repeatTime = 5000;

   const interval = async () => {
      // make the repeat time shorter (to a minimum of 1 second)
      if (repeatTime !== 1000)
         repeatTime -= 100;

      // add 1 extra flood to the board after 50 runs
      if (totalRuns > 50)
         addFlood(1);

      // add 2 extra floods to the board after 75 runs
      else if (totalRuns > 75)
         addFlood(2);

      // game has ended
      if (hasEnded)
         return;

      // the board has been completely flooded
      if (!board.includes(zamn))
         return whack.stop();

      // add a flood to the board
      addFlood(1);

      // edit the interaction's original reply
      await interaction.editReply({
         content: `> ${interaction.user}'s score: \`${score}\``,
         components: getComponents(false),
         allowedMentions: {
            parse: []
         }
      });

      // add to the total runs
      totalRuns ++;

      // repeat this again
      setTimeout(interval, repeatTime);
   };

   // initial repeat
   setTimeout(interval, repeatTime);


   // button interactions
   whack.on(`collect`, async buttonInteraction => {
      if (buttonInteraction.user.id !== interaction.user.id) {
         return buttonInteraction.reply({
            content: strip`
               this game is for ${interaction.user}, not YOU!!
               if you wanna play, use ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`whack-a-flood`, interaction.client.application.id)} yourself
            `,
            ephemeral: true
         });
      };

      // button info
      const [ _button, index ] = buttonInteraction.customId.split(`:`);


      // get the floods on the board
      const floods = getFloods();


      if (floods.includes(+index)) { // whacked a flood!
         // temporarily mark this space as yes
         board.splice(+index, 1, `✅`);

         // add to the score
         score ++;

         // update the interaction
         await buttonInteraction.update({
            content: `> ${interaction.user}'s score: \`${score}\``,
            components: getComponents(false),
            allowedMentions: {
               parse: []
            }
         });

         // re-add a zamn to this space
         board.splice(+index, 1, zamn);


      } else { // this space wasn't flooded
         // temporarily mark this space as no
         board.splice(+index, 1, `❌`);

         // game ended
         hasEnded = true;

         // defer the interaction's reply
         await buttonInteraction.deferUpdate();

         // stop the InteractionCollector
         return whack.stop();
      };
   });


   // game has ended
   whack.on(`end`, async (collected, reason) => {
      // the game timed out
      if (reason === `time`) {
         // game ended
         hasEnded = true;

         // edit the interaction's original reply
         return await interaction.editReply({
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(colours.red)
                  .setDescription(`**\`this game has timed out..\`** ${emojis.rip}`)
            ],
            components: getComponents(true)
         });
      };

      // add this score to the database
      const database = firestore.collection(`leaderboard-statistics`).doc(`whack-a-flood`);

      const { [interaction.user.id]: scores = [] } = (await database.get()).data();
      scores.push({
         score
      });

      await database.update({
         [interaction.user.id]: scores
      });

      // edit the interaction's original reply
      return await interaction.editReply({
         content: `> ${interaction.user}'s score: \`${score}\``,
         components: getComponents(true),
         allowedMentions: {
            parse: []
         }
      });
   });
};