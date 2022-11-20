export const data = new Discord.SlashCommandBuilder()
   .setName(`minesweeper`)
   .setDescription(`💣 there are some bombs hiding around go find them`);


import Discord from "discord.js";
import dayjs from "dayjs";
import { FieldValue } from "@google-cloud/firestore";

import { emojis, colours, autoArray, createCollectorExpirationTime, number, set, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // create a minesweeper board
   const numberOfBombs = number(3, 6);
   const bombLocations = (() => {
      const getBombLocations = () => {
         const array = autoArray(numberOfBombs, () => number(0, 24));
         if (set(array).length !== array.length)
            return getBombLocations();
         else
            return array;
      };
      return getBombLocations();
   })();

   const board = autoArray(5, (_, i) =>
      autoArray(5, (_, x) =>
         ({
            get emoji() {
               return this.isBomb
                  ? `💣`
                  : { 1: `1⃣`, 2: `2⃣`, 3: `3⃣`, 4: `4⃣`, 5: `5⃣`, 6: `6⃣` }[this.bombsAround];
            },
            isBomb:      bombLocations.includes(i * 5 + x),
            bombsAround: 0,
            revealed:    false
         })
      )
   );

   for (const [ rowIndex, row ] of board.entries()) {
      for (const [ gridIndex, grid ] of row.entries()) {
         // above row
         if (board[rowIndex - 1]?.[gridIndex - 1]?.isBomb) grid.bombsAround ++;
         if (board[rowIndex - 1]?.[gridIndex    ]?.isBomb) grid.bombsAround ++;
         if (board[rowIndex - 1]?.[gridIndex + 1]?.isBomb) grid.bombsAround ++;

         // same row
         if (board[rowIndex]?.[gridIndex - 1]?.isBomb) grid.bombsAround ++;
         if (board[rowIndex]?.[gridIndex + 1]?.isBomb) grid.bombsAround ++;

         // below row
         if (board[rowIndex + 1]?.[gridIndex - 1]?.isBomb) grid.bombsAround ++;
         if (board[rowIndex + 1]?.[gridIndex    ]?.isBomb) grid.bombsAround ++;
         if (board[rowIndex + 1]?.[gridIndex + 1]?.isBomb) grid.bombsAround ++;
      };
   };


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setDescription(strip`
            🚩 since there isn't a way for you to put down flags,
            ⏹️ just clear out all the squares that **aren't** 💣s, that works too~
         `)
   ];


   // components
   const components = board.map((row, rowIndex) =>
      new Discord.ActionRowBuilder()
         .setComponents(
            row.map((grid, gridIndex) =>
               new Discord.ButtonBuilder()
                  .setCustomId(`${interaction.id}:${rowIndex}:${gridIndex}`)
                  .setLabel(`\u200b`)
                  .setStyle(Discord.ButtonStyle.Primary)
            )
         )
   );


   // reply to the interaction
   await interaction.reply({
      embeds,
      components
   });


   // create an InteractionCollector
   const game = interaction.channel.createMessageComponentCollector({
      filter: i => i.customId.startsWith(interaction.id),
      time: createCollectorExpirationTime(interaction.createdTimestamp)
   });


   // function to re-create components
   let thisGrid;
   let complete = false;

   const recreateComponents = () => board.map((row, rowIndex) =>
      new Discord.ActionRowBuilder()
         .setComponents(
            row.map((grid, gridIndex) =>
               new Discord.ButtonBuilder({
                  label: thisGrid.isBomb
                     ? !grid.isBomb && !grid.bombsAround
                        ? `\u200b`
                        : null
                     : grid.revealed
                        ? !grid.isBomb && !grid.bombsAround
                           ? `\u200b`
                           : null
                        : `\u200b`,
                  emoji: thisGrid.isBomb
                     ? grid.revealed && grid.isBomb
                        ? `💥`
                        : grid.emoji
                     : grid.revealed
                        ? grid.emoji
                        : null
               })
                  .setCustomId(`${interaction.id}:${rowIndex}:${gridIndex}`)
                  .setStyle(
                     Discord.ButtonStyle[
                        grid.revealed
                           ? grid.isBomb
                              ? `Danger`
                              : `Secondary`
                           : complete
                              ? `Success`
                              : `Primary`
                     ]
                  )
                  .setDisabled(thisGrid.isBomb || grid.revealed || complete)
            )
         )
   );


   // button interactions
   game.on(`collect`, async buttonInteraction => {
      if (buttonInteraction.user.id !== interaction.user.id)
         return buttonInteraction.reply({
            content: strip`
               this game is for ${interaction.user}, not YOU!!
               if you wanna play, use ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`minesweeper`, interaction.client.application.id)} yourself
            `,
            ephemeral: true
         });


      // button info
      const [ _button, rowIndex, gridIndex ] = buttonInteraction.customId.split(`:`);
      thisGrid = board[rowIndex][gridIndex];


      // reveal this grid
      thisGrid.revealed = true;


      // blank grid, reveal adjacent grids too
      if (!thisGrid.isBomb && !thisGrid.bombsAround) {
         const gridPositionsToSearch = [[ +rowIndex, +gridIndex ]];

         for (const gridPosition of gridPositionsToSearch) {
            board[gridPosition[0]][gridPosition[1]].revealed = true;

            for (const [ rowIndex, row ] of board.entries()) {
               for (const [ gridIndex, grid ] of row.entries()) {
                  // this grid isn't in the radius of the current gridPosition
                  if (
                     !(
                        (rowIndex === gridPosition[0] - 1 && gridIndex === gridPosition[1])     || // above    grid
                        (rowIndex === gridPosition[0]     && gridIndex === gridPosition[1] - 1) || // left of  grid
                        (rowIndex === gridPosition[0]     && gridIndex === gridPosition[1] + 1) || // right of grid
                        (rowIndex === gridPosition[0] + 1 && gridIndex === gridPosition[1])        // below    grid
                     )
                  )
                     continue;

                  // this grid isn't blank
                  if (grid.isBomb || grid.bombsAround)
                     continue;

                  // this grid is already revealed
                  if (grid.revealed)
                     continue;

                  // add this grid to the list of grids to search
                  gridPositionsToSearch.push([ rowIndex, gridIndex ]);
               };
            };
         };
      };


      // bomb!! end the game
      if (thisGrid.isBomb)
         return game.stop(buttonInteraction);


      // all the remaining grids are bombs
      const remainingGridsBombs = board.every(row =>
         row.every(grid =>
            (grid.isBomb && !grid.revealed) || grid.revealed
         )
      );

      if (remainingGridsBombs) {
         complete = true;
         return game.stop(buttonInteraction);
      };


      // update the interaction
      return await buttonInteraction.update({
         components: recreateComponents()
      });
   });


   // game has ended
   game.on(`end`, async (collected, buttonInteraction) => {
      // time elapsed for this game
      const startTime = interaction.createdTimestamp;
      const endTime   = Date.now();
      const timeElapsed = endTime - startTime;

      // format the time
      const formattedTime = dayjs
         .duration(timeElapsed)
         .format(`m[m], s[s]`);

      // the payload for this interaction
      const payload = {
         content: `> ${interaction.user}'s time: \`${complete ? formattedTime : `n/a`}\``,
         embeds: [],
         components: recreateComponents(),
         allowedMentions: {
            parse: []
         }
      };

      // edit the interaction's original reply
      await buttonInteraction?.update(payload) || await interaction.editReply(payload);

      // add this time to the database
      if (!complete)
         return;

      const database = firestore.collection(`leaderboard-statistics`).doc(`minesweeper`);
      await database.update({
         [interaction.user.id]: FieldValue.arrayUnion({
            time: timeElapsed
         })
      });
   });
};