export const data = new Discord.SlashCommandBuilder()
   .setName(`show-legacy-suggestions`)
   .setDescription(`📋 show all your (open for discussion) legacy suggestions`)
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`type`)
         .setDescription(`🏷️ type of suggestions to show`)
         .setChoices({
            name: `🎮 game suggestions`,
            value: `game-suggestions`
         }, {
            name: `📂 server suggestions`,
            value: `server-suggestions`
         }, {
            name: `🧱 part suggestions`,
            value: `part-suggestions`
         }, {
            name: `📰 news board suggestions`,
            value: `news-board-suggestions`
         })
         .setRequired(true)
   );

export const guildOnly = true;


import Discord from "discord.js";
import { colours, emojis } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const type = interaction.options.getString(`type`);


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // get legacy suggestions by this user
   // const legacySuggestions = (
   //    await Promise.all(
   //       (await firestore.collection(`flooded-area/legacy-suggestions/${type}`).listDocuments())
   //          .map(async legacySuggestion => (await legacySuggestion.get()).data())
   //    )
   // )
   const legacySuggestions = cache[type]
      .filter(Boolean)
      .filter(legacySuggestion => legacySuggestion.suggester === interaction.user.id && legacySuggestion[`message-url`] && !legacySuggestion.deleted);


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setDescription(
            legacySuggestions
               .slice(0, 25)
               .map(legacySuggestion => `${Discord.hyperlink((legacySuggestion.suggestion.name || legacySuggestion.suggestion.content).slice(0, 30), legacySuggestion[`message-url`])} at ${Discord.time(Math.floor(legacySuggestion[`created-timestamp`] / 1000))}`)
               .join(`\n`)
            || `\`no legacy suggestions to show..\` ${emojis.rip}`
         )
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      content: legacySuggestions.length > 25
         ? `**only showing the first 25 suggestions due to embed limits**`
         : null,
      embeds
   });
};



// todo temp
import { Firestore } from "@google-cloud/firestore";
const firestore = new Firestore({
   credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY
   },
   projectId: process.env.GCP_PROJECT_ID,
   ssl: true
});

const cache = {
   "game-suggestions": await Promise.all(
      (await firestore.collection(`flooded-area/legacy-suggestions/game-suggestions`).listDocuments())
         .map(async legacySuggestion => (await legacySuggestion.get()).data())
   ),
   "server-suggestions": await Promise.all(
      (await firestore.collection(`flooded-area/legacy-suggestions/server-suggestions`).listDocuments())
         .map(async legacySuggestion => (await legacySuggestion.get()).data())
   ),
   "part-suggestions": await Promise.all(
      (await firestore.collection(`flooded-area/legacy-suggestions/part-suggestions`).listDocuments())
         .map(async legacySuggestion => (await legacySuggestion.get()).data())
   ),
   "news-board-suggestions": await Promise.all(
      (await firestore.collection(`flooded-area/legacy-suggestions/news-board-suggestions`).listDocuments())
         .map(async legacySuggestion => (await legacySuggestion.get()).data())
   )
};