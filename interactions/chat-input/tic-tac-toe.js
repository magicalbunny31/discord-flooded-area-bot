export const data = new Discord.SlashCommandBuilder()
   .setName(`tic-tac-toe`)
   .setDescription(`❌⭕ play some tic-tac-toe`)
   .addUserOption(
      new Discord.SlashCommandUserOption()
         .setName(`against`)
         .setDescription(`👤 who will you play against?`)
         .setRequired(true)
   );

export const guildOnly = true;


import Discord from "discord.js";
import { colours, emojis, choice, createCollectorExpirationTime, strip, sum } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // players
   const playerNoughts = interaction.user;
   const playerCrosses = interaction.options.getUser(`against`);


   // can't play against self
   if (playerNoughts.id === playerCrosses.id)
      return await interaction.reply({
         content: `you can't play against yourself, duh ${emojis.aie}`,
         ephemeral: true
      });


   // this user isn't a part of this guild
   const member = interaction.options.getMember(`against`);

   if (!member)
      return await interaction.reply({
         content: `i'm not sure if you've realised this but ${playerCrosses} isn't in this server`,
         ephemeral: true
      });


   // can't play against bot
   if (playerCrosses.id === interaction.client.user.id)
      return await interaction.reply({
         content: `if you'd play against me we'd draw every time`,
         ephemeral: true
      });


   // can't play against other bots
   if (playerCrosses.bot)
      return await interaction.reply({
         content: `bots are stupid and don't know how to play this game, choose an ACTUAL human!!`,
         ephemeral: true
      });


   // this member can't see this channel
   if (!interaction.channel.permissionsFor(member).has(Discord.PermissionFlagsBits.ViewChannel))
      return await interaction.reply({
         content: `${playerCrosses} doesn't have permission to view this channel: move somewhere else NOW!`,
         ephemeral: true
      });


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`${interaction.id}:accept`)
               .setLabel(`accept`)
               .setEmoji(`✅`)
               .setStyle(Discord.ButtonStyle.Success),
            new Discord.ButtonBuilder()
               .setCustomId(`${interaction.id}:decline`)
               .setLabel(`decline`)
               .setEmoji(`❌`)
               .setStyle(Discord.ButtonStyle.Danger)
         )
   ];


   // reply to the interaction
   await interaction.reply({
      content: strip`
         **${playerCrosses}, ${playerNoughts} has challenged you to a game of ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`tic-tac-toe`, interaction.client.application.id)}**!
         > do you accept? ${emojis.furthinking}
      `,
      components,
      allowedMentions: {
         users: [ playerCrosses.id ]
      }
   });


   // create an InteractionCollector
   const menu = interaction.channel.createMessageComponentCollector({
      filter: i => i.customId.startsWith(interaction.id),
      time: 300000 // five minutes
   });


   // game accepted
   const accepted = async interaction => {
      // decide the first player
      //                o  x
      const states = [ -1, 1 ];
      let turn = choice(states);


      // get the current player from state
      const getPlayerFrom = state => {
         switch (state) {
            case -1: return playerNoughts;
            case  1: return playerCrosses;
         };
      };


      // get the player's colour from the state
      const getColourFrom = state => {
         switch (state) {
            case -1: return `#02ff01`;
            case  1: return `#ff0203`;
         };
      };


      // the playing board, see above for what each number will be
      const board = [
         [ 0, 0, 0 ],
         [ 0, 0, 0 ],
         [ 0, 0, 0 ]
      ];


      // embeds
      const embeds = [
         new Discord.EmbedBuilder()
            .setColor(getColourFrom(turn))
            .setDescription(`${getPlayerFrom(turn)}, it's your turn! ${turn === -1 ? emojis.naught : emojis.no}`)
            .setFooter({
               text: strip`
                  provided by Mutant Standard emoji
                  mutant.tech
               `,
               iconURL: `https://mutant.tech/-rsc/favicons/fv-228.png`
            })
      ];


      // checking for a winner using maths!
      const checkWinner = () => {
         // ⬇️⬇️⬇️ vertical ⬆️⬆️⬆️
         for (const across of board) {
            const value = sum(across);
            if (value === -3) return playerNoughts;
            if (value ===  3) return playerCrosses;
         };

         // ⬅️⬅️⬅️ across ➡️➡️➡️
         for (let line = 0; line < 3; line ++) {
            const value = board[0][line] + board[1][line] + board[2][line];
            if (value === -3) return playerNoughts;
            if (value ===  3) return playerCrosses;
         };

         // ↘️↘️↘️ diagonal ↖️↖️↖️
         const leftDiagonal = board[0][0] + board[1][1] + board[2][2];
         if (leftDiagonal === -3) return playerNoughts;
         if (leftDiagonal ===  3) return playerCrosses;

         // ↙️↙️↙️ diagonal ↗️↗️↗️
         const rightDiagonal = board[0][2] + board[1][1] + board[2][0];
         if (rightDiagonal === -3) return playerNoughts;
         if (rightDiagonal ===  3) return playerCrosses;

         // 🪢🪢🪢 draw 🪢🪢🪢
         const isDraw = board.every(row => row.every(slot => slot));
         if (isDraw) return `draw`;

         // the game is still going!
         return false;
      };


      // get a button
      const button = (x, y) =>
         new Discord.ButtonBuilder()
            .setCustomId(`${interaction.id}:${x}:${y}`)
            .setLabel(`\u200b`)
            .setStyle(Discord.ButtonStyle.Primary);


      // array of buttons
      const buttons = [];

      for (let x = 0; x < 3; x ++)
         for (let y = 0; y < 3; y ++)
            buttons.push(button(x, y));


      // array of components
      const components = [];

      while (buttons.length)
         components.push(
            new Discord.ActionRowBuilder()
               .setComponents(buttons.splice(0, 3))
         );


      // update the interaction
      await interaction.update({
         content: `${emojis.naught} ${playerNoughts} \`vs\` ${playerCrosses} ${emojis.no}`,
         embeds,
         components,
         allowedMentions: {
            users: [ getPlayerFrom(turn).id ]
         }
      });


      // create an InteractionCollector
      const menu = interaction.channel.createMessageComponentCollector({
         filter: i => i.customId.startsWith(interaction.id),
         time: createCollectorExpirationTime(interaction.createdTimestamp)
      });


      // button interactions
      menu.on(`collect`, async buttonInteraction => {
         // this user isn't playing
         if (![ playerNoughts.id, playerCrosses.id ].includes(buttonInteraction.user.id))
            return await buttonInteraction.reply({
               content: strip`
                  this game is for ${playerNoughts} and ${playerCrosses}, not YOU!!
                  if you wanna play, use ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`tic-tac-toe`, interaction.client.application.id)} yourself
               `,
               ephemeral: true
            });


         // it isn't their turn yet
         if (
            (turn === -1 && buttonInteraction.user.id === playerCrosses.id)
            ||
            (turn ===  1 && buttonInteraction.user.id === playerNoughts.id)
         )
            return await buttonInteraction.reply({
               content: `oi, it's not your turn yet! ${emojis.shhh}`,
               ephemeral: true
            });


         // the booped button
         const [ _interactionId, x, y ] = buttonInteraction.customId.split(`:`);


         // update the board
         board[x][y] = turn;


         // update this button based on who pressed it
         components[x].components[y] = new Discord.ButtonBuilder()
            .setCustomId(`${interaction.id}:${x}:${y}`)
            .setEmoji(turn === -1 ? emojis.naught               : emojis.no)
            .setStyle(turn === -1 ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger)
            .setDisabled(true);


         // function to update the database
         const updateDatabase = async (userId, against, outcome) => {
            const database = firestore.collection(`leaderboard-statistics`).doc(`tic-tac-toe`);

            const { [userId]: games = [] } = (await database.get()).data();
            games.push({
               against,
               outcome
            });

            await database.update({
               [userId]: games
            });
         };


         // check if there's a winner
         const winner = checkWinner();

         if (winner.id) { // we have a winner!
            // update the embeds
            embeds[0]
               .setDescription(`**${winner} wins!** 🎉`);

            // disable the components
            for (const actionRow of components)
               for (const component of actionRow.components)
                  component.data.disabled = true;

            // stop the InteractionCollector
            menu.stop(`game ended`);

            // update the database
            await updateDatabase(playerNoughts.id, playerCrosses.id, winner.id === playerNoughts.id ? `win` : `lose`);
            await updateDatabase(playerCrosses.id, playerNoughts.id, winner.id === playerNoughts.id ? `win` : `lose`);

         } else if (winner === `draw`) { // it's a draw
            // update the embeds
            embeds[0]
               .setColor(colours.red)
               .setDescription(`**it's a draw..** ⚔️`);

            // stop the InteractionCollector
            menu.stop(`game ended`);

            // update the database
            await updateDatabase(playerNoughts.id, playerCrosses.id, `draw`);
            await updateDatabase(playerCrosses.id, playerNoughts.id, `draw`);

         } else { // the game is still going!
            // change turns
            turn = turn === -1 ? 1 : -1;

            // update the embeds
            embeds[0]
               .setColor(getColourFrom(turn))
               .setDescription(`${getPlayerFrom(turn)}, it's your turn! ${turn === -1 ? emojis.naught : emojis.no}`);
         };


         // update the interaction
         return await buttonInteraction.update({
            content: `${emojis.naught} ${winner !== `draw` && turn === -1 ? `**${playerNoughts}**` : playerNoughts} \`vs\` ${winner !== `draw` && turn === 1 ? `**${playerCrosses}**` : playerCrosses} ${emojis.no}`,
            embeds,
            components,
            allowedMentions: {
               users: winner !== `draw` ? [ getPlayerFrom(turn).id ] : []
            }
         });
      });


      // menu timed out
      menu.on(`end`, async (collected, reason) => {
         // nah, the game ended
         if (reason === `game ended`)
            return;

         // embeds
         embeds.push(
            new Discord.EmbedBuilder()
               .setColor(colours.red)
               .setDescription(`**\`this game has timed out..\`** ${emojis.rip}`)
         );

         // disable the components
         for (const actionRow of components)
            for (const component of actionRow.components)
               component.data.disabled = true;

         // edit the interaction's original reply
         return await interaction.editReply({
            content: `${emojis.naught} ${playerNoughts} \`vs\` ${playerCrosses} ${emojis.no}`,
            embeds,
            components,
            allowedMentions: {
               parse: []
            }
         });
      });
   };


   // game declined
   const declined = async interaction => {
      // disable the components
      for (const actionRow of components)
         for (const component of actionRow.components)
            component.setDisabled(true);

      // update the interaction
      return await interaction.update({
         content: strip`
            **${playerCrosses}, ${playerNoughts} has challenged you to a game of ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`tic-tac-toe`, interaction.client.application.id)}**!
            > they said no.. ${emojis.sweats}
         `,
         components,
         allowedMentions: {
            users: [ playerCrosses.id ]
         }
      });
   };


   // await for the other member to accept
   menu.on(`collect`, async buttonInteraction => {
      // this isn't the target user
      if (![ playerNoughts.id, playerCrosses.id ].includes(buttonInteraction.user.id))
         return await buttonInteraction.reply({
            content: strip`
               ${playerNoughts} is asking ${playerCrosses}, not YOU!!
               if you wanna play, use ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`tic-tac-toe`, interaction.client.application.id)} yourself
            `,
            ephemeral: true
         });

      // this is the command user
      if (buttonInteraction.user.id === playerNoughts.id)
         return await buttonInteraction.reply({
            content: `we're waiting for ${playerCrosses} to respond, not you!`,
            ephemeral: true
         });

      // stop the InteractionCollector
      menu.stop();

      // the booped button
      const hasAccepted = buttonInteraction.customId.endsWith(`accept`);

      // run each code depending on if the user accepted or not
      return hasAccepted
         ? await accepted(buttonInteraction)
         : await declined(buttonInteraction);
   });


   // they didn't respond
   menu.on(`end`, async (collected, reason) => {
      // they uh did respond
      if (reason !== `time`)
         return;

      // disable the components
      for (const actionRow of components)
         for (const component of actionRow.components)
            component.data.disabled = true;

      // edit the interaction
      return await interaction.editReply({
         content: strip`
            **${playerCrosses}, ${playerNoughts} has challenged you to a game of ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`tic-tac-toe`, interaction.client.application.id)}**!
            > uhm uhh uh they didn't respond.. ${emojis.sweats}
         `,
         components,
         allowedMentions: {
            users: [ playerCrosses.id ]
         }
      });
   });
};