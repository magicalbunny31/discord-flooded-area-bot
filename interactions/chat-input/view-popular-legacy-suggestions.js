export const data = new Discord.SlashCommandBuilder()
   .setName(`view-popular-legacy-suggestions`)
   .setDescription(`📜 view the popular legacy suggestions`)
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`type`)
         .setDescription(`🏷️ type of legacy suggestion to view`)
         .setChoices({
            name: `🎮 legacy game suggestions`,
            value: `game-suggestions`
         }, {
            name: `📂 legacy server suggestions`,
            value: `server-suggestions`
         }, {
            name: `🧱 legacy part suggestions`,
            value: `part-suggestions`
         }, {
            name: `📰 legacy news board suggestions`,
            value: `news-board-suggestions`
         })
         .setRequired(true)
   )
   .addUserOption(
      new Discord.SlashCommandUserOption()
         .setName(`suggester`)
         .setDescription(`👤 view popular legacy suggestions made by this user`)
   );

export const guildOnly = true;


import Discord from "discord.js";
import { colours } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // function to create the preview text from a suggestion's content
   const createPreviewText = content => {
      const maxLength = 50;
      const splitPreviewContent = content.replace(/[\n]+/g, ` `).split(` `);
      let previewContent = ``;

      for (const [ i, word ] of splitPreviewContent.entries()) {
         if (previewContent.trim().length + word.length >= maxLength) {
            // limit the thread name to 50 characters without truncating a word
            previewContent = `${previewContent.trim() || word.slice(0, maxLength)}...`;
            break;

         } else {
            // add this word the thread name
            previewContent += ` ${word}`;

            // this name can fit the whole of the thread's name
            if (i + 1 === splitPreviewContent.length)
               previewContent = previewContent.trim();
         };
      };

      return previewContent;
   };


   // options
   const type      = interaction.options.getString(`type`);
   const suggester = interaction.options.getUser  (`suggester`);


   // get suggestions
   let suggestions = (await import(`../../assets/${type}.json`, { assert: { type: `json` }}))
      .default
      .filter(suggestion => suggestion.upvoters.length - suggestion.downvoters.length >= 10 && !suggestion.deleted)

   if (suggester)
      suggestions = suggestions.filter(suggestion => suggestion.suggester === suggester.id);

   suggestions = suggestions.map(suggestion => `\\💬 ${Discord.userMention(suggestion.suggester)}: ${Discord.hyperlink(Discord.escapeMarkdown(createPreviewText(type !== `part-suggestions` ? suggestion.suggestion.content : suggestion.suggestion.name)), suggestion[`message-url`], `${suggestion[`message-url`]} 🔗`)}`);


   // split the suggestions array into chunks of 10
   const size = 10;
   suggestions = Array.from(
      new Array(Math.ceil(suggestions.length / size)),
      (_element, i) => suggestions.slice(i * size, i * size + size)
   );


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setDescription(
            suggestions[0].join(`\n`)
         )
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`view-popular-legacy-suggestions:deez-nuts:deez-nuts:deez-nuts`) // message component custom ids can't be duplicated, this button is completely cosmetic in this context
               .setEmoji(`⬅️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(true),
            new Discord.ButtonBuilder()
               .setCustomId(`view-popular-legacy-suggestions:1:${type}${suggester ? `:${suggester}` : ``}`)
               .setEmoji(`➡️`)
               .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
               .setCustomId(`this button shows the pages, that's it`)
               .setLabel(`1 / ${suggestions.length}`)
               .setStyle(Discord.ButtonStyle.Secondary)
               .setDisabled(true)
         ])
   ];


   // reply to the interaction
   return await interaction.reply({
      embeds,
      components,
      ephemeral: true
   });
};