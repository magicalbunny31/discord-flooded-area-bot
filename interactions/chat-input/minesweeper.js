export const data = new Discord.SlashCommandBuilder()
   .setName(`minesweeper`)
   .setDescription(`💣 there are some bombs hiding around go find them`);


import Discord from "discord.js";
import dayjs from "dayjs";

import { emojis, colours, autoArray, createCollectorExpirationTime, number, set, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // create a minesweeper board
   const createBoard = (row, grid) => {
      // get locations for the bombs
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


      // create the board and place bombs on it
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


      // place the numbers to indicate where the bombs are
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


      // parameters were specified, this means to generate a new board *without* a bomb in this row-grid
      if (row !== undefined && grid !== undefined)
         if (board[row][grid].isBomb)
            return createBoard(row, grid);


      // return the board
      return board;
   };

   let board = createBoard();


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setDescription(strip`
            🚩 since there isn't a way for you to put down flags,
            ⏹️ just clear out all the squares that **aren't** 💣s, that works too~
         `),

      new Discord.EmbedBuilder()
         .setColor(colours.yellow)
         .setDescription(`⌚ the timer starts when you clear your first square - choose wisely!`)
   ];


   // components
   const components = board.map((row, rowIndex) =>
      new Discord.ActionRowBuilder()
         .setComponents(
            row.map((_grid, gridIndex) =>
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
      // time: createCollectorExpirationTime(interaction.createdTimestamp)
      time: 10000
   });


   // function to re-create components
   let thisGrid;
   let complete = false;
   let startTime;

   const recreateComponents = (disabled = false) => board.map((row, rowIndex) =>
      new Discord.ActionRowBuilder()
         .setComponents(
            row.map((grid, gridIndex) =>
               new Discord.ButtonBuilder({
                  label: thisGrid?.isBomb
                     ? !grid.isBomb && !grid.bombsAround
                        ? `\u200b`
                        : null
                     : grid.revealed
                        ? !grid.isBomb && !grid.bombsAround
                           ? `\u200b`
                           : null
                        : `\u200b`,
                  emoji: thisGrid?.isBomb
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
                  .setDisabled(thisGrid?.isBomb || grid.revealed || complete || disabled)
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


      // this is a bomb, however this is also the first square: create a new board
      if (!startTime && thisGrid.isBomb) {
         board = createBoard(rowIndex, gridIndex);
         thisGrid = board[rowIndex][gridIndex];
         thisGrid.revealed = true;

      } else if (thisGrid.isBomb) // bomb!! end the game
         return game.stop(buttonInteraction);


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
                        (rowIndex === gridPosition[0] - 1 && gridIndex === gridPosition[1] - 1) || // ↖️
                        (rowIndex === gridPosition[0] - 1 && gridIndex === gridPosition[1])     || // ⬆️
                        (rowIndex === gridPosition[0] - 1 && gridIndex === gridPosition[1] + 1) || // ↗️

                        (rowIndex === gridPosition[0]     && gridIndex === gridPosition[1] - 1) || // ⬅️
                        (rowIndex === gridPosition[0]     && gridIndex === gridPosition[1] + 1) || // ➡️

                        (rowIndex === gridPosition[0] + 1 && gridIndex === gridPosition[1] - 1) || // ↙️
                        (rowIndex === gridPosition[0] + 1 && gridIndex === gridPosition[1])     || // ⬇️
                        (rowIndex === gridPosition[0] + 1 && gridIndex === gridPosition[1] + 1)    // ↘️
                     )
                  )
                     continue;

                  // this grid is a bomb
                  if (grid.isBomb)
                     continue;

                  // this grid has bombs around it but is next to a blank square that was revealed: reveal it but *don't* search around it
                  if (grid.bombsAround)
                     board[rowIndex][gridIndex].revealed = true;

                  // this grid is already (or has just been) revealed
                  if (grid.revealed)
                     continue;

                  // add this grid to the list of grids to search
                  gridPositionsToSearch.push([ rowIndex, gridIndex ]);
               };
            };
         };
      };


      // this is the first square, start the timer
      startTime ||= buttonInteraction.createdTimestamp;


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
         embeds: [
            embeds[0],
            new Discord.EmbedBuilder()
               .setColor(colours.yellow)
               .setDescription(`⌚ started ${Discord.time(Math.floor(startTime / 1000), Discord.TimestampStyles.RelativeTime)}`)
         ],
         components: recreateComponents()
      });
   });


   // game has ended
   game.on(`end`, async (collected, buttonInteraction) => {
      // the game timed out
      if (buttonInteraction === `time`)
         return await interaction.editReply({
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(colours.red)
                  .setDescription(`**\`this game has timed out..\`** ${emojis.rip}`)
            ],
            components: recreateComponents(true)
         });

      // time elapsed for this game
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

      const { [interaction.user.id]: times = [] } = (await database.get()).data();
      times.push({
         time: timeElapsed
      });

      await database.update({
         [interaction.user.id]: times
      });
   });
};