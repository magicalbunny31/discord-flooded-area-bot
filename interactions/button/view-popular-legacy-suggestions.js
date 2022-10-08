import Discord from "discord.js";
import { colours } from "@magicalbunny31/awesome-utility-stuff";

/**
 * show the reaction roles
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, index, type, suggester ] = interaction.customId.split(`:`);


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
            suggestions[+index].join(`\n`)
         )
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`view-popular-legacy-suggestions:${+index - 1}:${type}${suggester ? `:${suggester}` : ``}`) // message component custom ids can't be duplicated, this button is completely cosmetic in this context
               .setEmoji(`⬅️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(+index - 1 < 0),
            new Discord.ButtonBuilder()
               .setCustomId(`view-popular-legacy-suggestions:${+index + 1}:${type}${suggester ? `:${suggester}` : ``}`)
               .setEmoji(`➡️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(+index + 1 === suggestions.length),
            new Discord.ButtonBuilder()
               .setCustomId(`this button shows the pages, that's it`)
               .setLabel(`${+index + 1} / ${suggestions.length}`)
               .setStyle(Discord.ButtonStyle.Secondary)
               .setDisabled(true)
         ])
   ];


   // update the interaction
   return await interaction.update({
      embeds,
      components
   });
};