export const name = "currency-personal-item";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES ];

import Discord from "discord.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button ] = interaction.customId.split(`:`);


   // this user's currency
   const userCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(interaction.user.id);
   const userCurrencyDocSnap = await userCurrencyDocRef.get();
   const userCurrencyDocData = userCurrencyDocSnap.data() || {};


   // items
   const userItem = userCurrencyDocData.item || {};

   const hasPersonalItem = !!Object.values(userItem).length;


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`currency-personal-item`)
      .setTitle(`🏷️ ${hasPersonalItem ? `Edit` : `Create`} personal item`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`name`)
                  .setLabel(`WHAT IS YOUR ITEM CALLED?`)
                  .setPlaceholder(`Enter a name...`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setValue(userItem.name || ``)
                  .setMaxLength(50)
                  .setRequired(true)
            ),
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`price`)
                  .setLabel(`HOW MUCH IS YOUR ITEM?`)
                  .setPlaceholder(`Enter a number from 1-999999...`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setValue(userItem.price ? `${userItem.price}` : ``)
                  .setMaxLength(6)
                  .setRequired(true)
            )
      );


   // show the modal
   await interaction.showModal(modal);
};