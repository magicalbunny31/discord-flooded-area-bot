export const data = new Discord.SlashCommandBuilder()
   .setName(`auto-responses`)
   .setDescription(`💬 manage auto-responses`)
   .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageMessages);

export const guildOnly = true;


import Discord from "discord.js";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
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
            (autoResponses[0] || [])
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
      ...(autoResponses[0] || []).length
         ? [
            new Discord.ActionRowBuilder()
               .setComponents([
                  new Discord.SelectMenuBuilder()
                     .setCustomId(`view-auto-response`)
                     .setPlaceholder(`📋 scroll through the auto-responses..`)
                     .setOptions(
                        (autoResponses[0] || [])
                           .map(([ name ]) =>
                              new Discord.SelectMenuOptionBuilder()
                                 .setLabel(`💬 ${name}`)
                                 .setValue(`${name}:0`)
                           )
                     )
                     .setDisabled(!autoResponses.length)
               ]),

            new Discord.ActionRowBuilder()
               .setComponents([
                  new Discord.ButtonBuilder()
                     .setCustomId(`show-auto-responses:deez-nuts:deez-nuts:deez-nuts`) // message component custom ids can't be duplicated, this button is completely cosmetic in this context
                     .setEmoji(`⬅️`)
                     .setStyle(Discord.ButtonStyle.Primary)
                     .setDisabled(true),
                  new Discord.ButtonBuilder()
                     .setCustomId(`show-auto-responses:1:1:2`)
                     .setEmoji(`➡️`)
                     .setStyle(Discord.ButtonStyle.Primary)
                     .setDisabled(autoResponses.length <= 1),
                  new Discord.ButtonBuilder()
                     .setCustomId(`this button shows the pages, that's it`)
                     .setLabel(`1 / ${autoResponses.length || 1}`)
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
               .setCustomId(`show-auto-responses:0:${(autoResponses[0] || []).length ? 2 : 0}:1`)
               .setLabel(`refresh`)
               .setEmoji(`🔃`)
               .setStyle(Discord.ButtonStyle.Secondary)
         ])
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds,
      components
   });
};