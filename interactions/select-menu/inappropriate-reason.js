import Discord from "discord.js";
import { FieldValue } from "@google-cloud/firestore";

/**
 * @param {Discord.AnySelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu, id ] = interaction.customId.split(`:`);
   const [ reason ] = interaction.values;


   // embeds
   interaction.message.embeds[1].data.fields[0].value = `> ${
      {
         "avatar": `Their avatar is inappropriate`,
         "build":  `They built something inappropriate`,
         "chat":   `They said something inappropriate`,
         "other":  `Other...`
      }[reason]
   }`;


   // set the selected value(s) as default in its select menu
   const components = interaction.message.components;

   const selectMenuIndex = components.flat().findIndex(({ components }) => components[0].customId === interaction.customId);
   const selectedValuesIndexes = components[selectMenuIndex].components[0].options.findIndex(option => option.value === reason);

   for (const option of components[selectMenuIndex].components[0].options)
      option.default = false;

   components[selectMenuIndex].components[0].options[selectedValuesIndexes].default = true;


   // edit the confirm reason button
   Object.assign(components[1].components[0].data, {
      custom_id: `create-report:${id}:confirm-input:${reason}`,
      disabled: false
   });


   // update the interaction
   return await interaction.update({
      embeds: interaction.message.embeds,
      components
   });
};