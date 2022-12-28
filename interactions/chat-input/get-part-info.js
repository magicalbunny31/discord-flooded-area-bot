export const data = new Discord.SlashCommandBuilder()
   .setName(`get-part-info`)
   .setDescription(`🏷️ get some info on a part`)
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`part`)
         .setDescription(`🧱 part to get info for`)
         .setAutocomplete(true)
         .setRequired(true)
   );


import Discord from "discord.js";
import fs from "fs/promises";

import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const partId = interaction.options.getString(`part`);


   // defer the interaction
   await interaction.deferReply();


   // parts
   const parts = (await firestore.collection(`command`).doc(`get-part-info`).get()).data();
   const part = parts[partId];


   // this option isn't in the parts array
   if (!part)
      return await interaction.editReply({
         content: strip`
            ❌ **\`${partId}\` isn't a part!**
            > try selecting from the inline autocomplete choices for parts ${emojis.happ}
         `
      });


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setAuthor({
            name: part.name
         })
         .setThumbnail(`attachment://${partId}.png`)
         .setDescription(`*${part[`flavour-text`]}*`)
         .addFields({
            name: `❓ what is it?`,
            value: `>>> ${part.description}`,
            inline: false
         }, {
            name: `${
               part[`obtained-through`] === `finding it out in the open`
                  ? `⬛`
                  : part[`obtained-through`] === `crafting or part packs`
                     ? `🟥`
                     : `🟨`
            } obtained through..`,
            value: part[`obtained-through`],
            inline: true
         }, {
            name: `⚒️ crafting recipe`,
            value: part[`crafting-recipe`]
               .map(({ quantity, part }) => `\`${quantity}\` ${part}`)
               .join(`\n`)
               || `\u200b`,
            inline: true
         }, {
            name: `🆔 id (case-sensitive)`,
            value: `\`${partId}\``,
            inline: true
         })
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds,

      files: (await fs.readdir(`./assets/parts`)).find(file => file === `${partId}.png`)
         ? [
            new Discord.AttachmentBuilder()
               .setFile(`./assets/parts/${partId}.png`)
               .setName(`${partId}.png`)
               .setDescription(partId)
         ]
         : []
   });
};