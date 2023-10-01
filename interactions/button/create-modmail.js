export const name = "create-modmail";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";

import cache from "../../data/cache.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, id ] = interaction.customId.split(`:`);


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`create-modmail`)
      .setTitle(`📬 Modmail Submissions`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`content`)
                  .setLabel(`MODMAIL CONTENT`)
                  .setPlaceholder(`What would you like to send to the Head of Moderation?`)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setMaxLength(4000)
                  .setRequired(true)
            )
      );


   // the current fields for editing a report
   if (id) {
      const data = cache.get(id);

      if (data.content)
         modal.components[0].components[0].setValue(data.content);
   };


   // show the modal
   await interaction.showModal(modal);
};