export const name = "currency-create-flea-market-listing";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

import Discord from "discord.js";

/**
 * @param {Discord.StringSelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu ] = interaction.customId.split(`:`);
   const [ itemSellerIdOrName ] = interaction.values;


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`currency-create-flea-market-listing:${itemSellerIdOrName}`)
      .setTitle(`💸 List an item on the flea market`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`price`)
                  .setLabel(`HOW MUCH DO YOU WANT TO LIST IT FOR?`)
                  .setPlaceholder(`Enter a number from 1-999...`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMaxLength(3)
                  .setRequired(true)
            )
      );


   // show the modal
   await interaction.showModal(modal);
};