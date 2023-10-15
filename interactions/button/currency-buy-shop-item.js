export const name = "currency-buy-shop-item";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

import Discord from "discord.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, itemSeller ] = interaction.customId.split(`:`);


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`currency-buy-shop-item:${itemSeller}`)
      .setTitle(`🛍️ Buy item`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`quantity`)
                  .setLabel(`HOW MUCH OF THIS ITEM DO YOU WANT TO BUY?`)
                  .setPlaceholder(`Enter a number from 1-50...`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMaxLength(2)
                  .setRequired(true)
            )
      );


   // show the modal
   await interaction.showModal(modal);
};