export const name = "currency-stalk-market";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

import Discord from "discord.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, type ] = interaction.customId.split(`:`);

   const isBuying = type === `buy-carrots`;


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`currency-stalk-market:${type}`)
      .setTitle(
         isBuying
            ? `💳 Buy carrots`
            : `💰 Sell carrots`
      )
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`quantity`)
                  .setLabel(`HOW MANY CARROTS WILL YOU ${isBuying ? `BUY` : `SELL`}?`)
                  .setPlaceholder(`Enter a number from 1-999...`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMaxLength(3)
                  .setRequired(true)
            )
      );


   // show the modal
   await interaction.showModal(modal);
};