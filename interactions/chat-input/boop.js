export const data = new Discord.SlashCommandBuilder()
   .setName(`boop`)
   .setDescription(`boop haiii`)
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`haiii`)
         .setDescription(`boop haiii`)
   );


import Discord from "discord.js";
import { FieldValue } from "@google-cloud/firestore";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // defer the interaction
   await interaction.deferReply();


   // add this to the database
   await firestore.collection(`leaderboard-statistics`).doc(`boop haiii`).update({
      [interaction.user.id]: FieldValue.increment(1)
   });


   // edit the deferred interaction
   await interaction.editReply({
      content: `boop haiii`
   });
};