import Discord from "discord.js";
import { colours, emojis } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.SelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // values
   const [ value, index ] = interaction.values[0].split(`:`);


   // "defer" the interaction
   // disable each component
   for (const actionRow of interaction.message.components)
      for (const component of actionRow.components)
         component.data.disabled = true;

   // set the selected option as default
   const selectMenu = interaction.message.components[0].components[0];
   const selectedOptionIndex = selectMenu.options.findIndex(option => option.value === `${value}:${index}`);
   selectMenu.options[selectedOptionIndex].default = true;

   // edit the selected option to show a loading state
   selectMenu.data.options[selectedOptionIndex].emoji = Discord.parseEmoji(emojis.loading);

   // update the interaction
   await interaction.update({
      components: interaction.message.components
   });


   // get this auto-response
   const database = firestore.collection(`command`).doc(`auto-responses`);
   const autoResponse = (await database.get()).data()[value];


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setFields({
            name: `🏷️ \`RULE NAME\``,
            value: value
         }, {
            name: `📋 \`MESSAGE CONTENT CONTAINS\``,
            value: autoResponse[`message-content-contains`]
               .map(phrase => `> \`${phrase}\``)
               .join(`\n`)
         }, {
            name: `💭 \`REPLY WITH\``,
            value: autoResponse[`reply-with`]
         })
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`show-auto-responses:${index}:0:0`)
               .setEmoji(`🔙`)
               .setStyle(Discord.ButtonStyle.Primary)
         ]),

      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`edit-auto-response:${value}`)
               .setLabel(`edit auto-response`)
               .setEmoji(`📝`)
               .setStyle(Discord.ButtonStyle.Secondary),
            new Discord.ButtonBuilder()
               .setCustomId(`delete-auto-response:${value}:ask-for-confirmation`)
               .setLabel(`delete auto-response`)
               .setEmoji(`🗑️`)
               .setStyle(Discord.ButtonStyle.Danger)
         ])
   ];


   // edit the interaction
   return await interaction.editReply({
      embeds,
      components
   });
};