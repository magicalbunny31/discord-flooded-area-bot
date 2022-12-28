export const data = new Discord.SlashCommandBuilder()
   .setName(`leaderboard`)
   .setDescription(`🏅 flex your statistics`);


import Discord from "discord.js";
import { colours, emojis } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setDescription(`${emojis.foxbox}${emojis.foxsleep}${emojis.foxsnug}`)
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`leaderboard:menu`)
               .setPlaceholder(`select a category..`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`/america`)
                     .setEmoji(emojis.flooded_area)
                     .setValue(`/america`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`/boop haiii`)
                     .setEmoji(emojis.flooded_area)
                     .setValue(`/boop haiii`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`/minesweeper`)
                     .setEmoji(emojis.flooded_area)
                     .setValue(`/minesweeper`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`/tic-tac-toe`)
                     .setEmoji(emojis.flooded_area)
                     .setValue(`/tic-tac-toe`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`/votekick`)
                     .setEmoji(emojis.flooded_area)
                     .setValue(`/votekick`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`/whack-a-flood`)
                     .setEmoji(emojis.flooded_area)
                     .setValue(`/whack-a-flood`)
               )
         )
   ];


   // reply to the interaction
   return await interaction.reply({
      embeds,
      components,
      ephemeral: true
   });
};