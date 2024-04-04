export const name = "currency-increase-personal-shop-item-quantity";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES ];

import Discord from "discord.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button ] = interaction.customId.split(`:`);


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`currency-increase-personal-shop-item-quantity`)
      .setTitle(`📦 Increase item quantity`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`quantity`)
                  .setLabel(`INCREASE THIS ITEM'S QUANTITY BY`)
                  .setPlaceholder(`Enter a number from 1-50...`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMaxLength(2)
                  .setRequired(true)
            )
      );


   // show the modal
   await interaction.showModal(modal);
};