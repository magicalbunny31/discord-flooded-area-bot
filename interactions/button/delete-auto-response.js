import Discord from "discord.js";
import { FieldValue } from "@google-cloud/firestore";

import { colours } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, name, askForConfirmation ] = interaction.customId.split(`:`);


   if (askForConfirmation === `ask-for-confirmation`) { // ask for confirmation to delete
      // embeds
      const embeds = [
         new Discord.EmbedBuilder(interaction.message.embeds[0].data)
            .setColor(colours.red)
      ];


      // components
      const components = interaction.message.components;

      Object.assign(components[1].components[1].data, {
         custom_id: `delete-auto-response:${name}`,
         label: `confirm delete auto-response?`,
         emoji: Discord.parseEmoji(`💣`)
      });


      // update the interaction
      return await interaction.update({
         embeds,
         components
      });


   } else { // delete the auto-response
      // remove the auto-response from the database
      const database = firestore.collection(`command`).doc(`auto-responses`);
      await database.update({
         [name]: FieldValue.delete()
      });


      // embeds
      const embeds = [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setDescription(`💥 **\`auto-response deleted!\`**`)
      ];


      // components
      const components = interaction.message.components;

      components.pop();


      // update the interaction
      return await interaction.update({
         embeds,
         components
      });
   };
};