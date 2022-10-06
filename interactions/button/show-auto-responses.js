import Discord from "discord.js";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, index, actionRowIndex, componentIndex ] = interaction.customId.split(`:`);


   // "defer" the interaction
   // disable each component
   for (const actionRow of interaction.message.components)
      for (const component of actionRow.components)
         component.data.disabled = true;

   // edit the button to show a loading state
   Object.assign(interaction.message.components[+actionRowIndex].components[+componentIndex].data, {
      emoji: Discord.parseEmoji(emojis.loading),
      label: null
   });

   // update the interaction
   await interaction.update({
      components: interaction.message.components
   });


   // get auto-responses
   const database = firestore.collection(`command`).doc(`auto-responses`);
   const data = await database.get();
   let autoResponses = Object.entries(data.data())
      .sort((a, b) => a[0].localeCompare(b[0]));


   // split the auto-responses array into chunks of 5
   const size = 5;
   autoResponses = Array.from(
      new Array(Math.ceil(autoResponses.length / size)),
      (_element, i) => autoResponses.slice(i * size, i * size + size)
   );


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setDescription(
            (autoResponses[+index] || [])
               .map(([ name, autoResponse ]) => strip`
                  \\💬 **${name}**
                  > ${
                     (() => {
                        const splitPreviewContent = Discord.cleanContent(autoResponse[`reply-with`], interaction.channel).replace(/[\n]+/g, ` `).split(` `);
                        let previewContent = ``;

                        for (const [ i, word ] of splitPreviewContent.entries()) {
                           if (previewContent.trim().length + word.length >= 30) {
                              // limit the thread name to 30 characters without truncating a word
                              previewContent = `${previewContent.trim() || word.slice(0, 30)}...`;
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
                     })()
                  }
               `)
               .join(`\n\n`)
            || `${emojis.rip} **\`no auto-responses set up..\`**`
         )
   ];


   // components
   const components = [
      ...(autoResponses[+index] || []).length
         ? [
            new Discord.ActionRowBuilder()
               .setComponents([
                  new Discord.SelectMenuBuilder()
                     .setCustomId(`view-auto-response`)
                     .setPlaceholder(`📋 scroll through the auto-responses..`)
                     .setOptions(
                        (autoResponses[+index] || [])
                           .map(([ name ]) =>
                              new Discord.SelectMenuOptionBuilder()
                                 .setLabel(`💬 ${name}`)
                                 .setValue(`${name}:${index}`)
                           )
                     )
                     .setDisabled(!autoResponses.length)
               ]),

            new Discord.ActionRowBuilder()
               .setComponents([
                  new Discord.ButtonBuilder()
                     .setCustomId(`show-auto-responses:${+index - 1}:1:2`)
                     .setEmoji(`⬅️`)
                     .setStyle(Discord.ButtonStyle.Primary)
                     .setDisabled(+index - 1 < 0),
                  new Discord.ButtonBuilder()
                     .setCustomId(`show-auto-responses:${+index + 1}:1:2`)
                     .setEmoji(`➡️`)
                     .setStyle(Discord.ButtonStyle.Primary)
                     .setDisabled(+index + 1 === autoResponses.length),
                  new Discord.ButtonBuilder()
                     .setCustomId(`this button shows the pages, that's it`)
                     .setLabel(`${+index + 1} / ${autoResponses.length || 1}`)
                     .setStyle(Discord.ButtonStyle.Secondary)
                     .setDisabled(true)
               ])
         ]
         : [],

      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`create-auto-response`)
               .setLabel(`create auto-response`)
               .setEmoji(`➕`)
               .setStyle(Discord.ButtonStyle.Success),
            new Discord.ButtonBuilder()
               .setCustomId(`show-auto-responses:${index}:${(autoResponses[+index] || []).length ? 2 : 0}:1`)
               .setLabel(`refresh`)
               .setEmoji(`🔃`)
               .setStyle(Discord.ButtonStyle.Secondary)
         ])
   ];


   // edit the interaction
   return await interaction.editReply({
      embeds,
      components
   });
};