export const name = "currency-increase-personal-shop-item-quantity";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

import Discord from "discord.js";
import dayjs from "dayjs";
import { FieldValue, Timestamp } from "@google-cloud/firestore";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal info
   const [ _modal ] = interaction.customId.split(`:`);


   // fields
   const rawQuantity = interaction.fields.getTextInputValue(`quantity`).trim();
   const quantity    = +rawQuantity;


   // data to show
   const data = {
      [process.env.GUILD_FLOODED_AREA]: {
         colour: colours.flooded_area
      },

      [process.env.GUILD_SPACED_OUT]: {
         colour: colours.spaced_out
      }
   }[interaction.guild.id];


   // "defer" this reply
   // update the message if this is a command reply and this is the same command user as the button booper (or if the message is ephemeral)
   const isSameCommandUser = interaction.user.id === interaction.message.interaction?.user.id;
   const isEphemeral = interaction.message.flags.has(Discord.MessageFlags.Ephemeral);

   if (isSameCommandUser || isEphemeral) {
      const deferComponents = interaction.message.components;

      Object.assign(deferComponents[1].components[0].data, {
         emoji: Discord.parseEmoji(emojis.loading),
         disabled: true
      });

      for (const actionRow of deferComponents)
         for (const component of actionRow.components)
            component.data.disabled = true;

      await interaction.update({
         components: deferComponents
      });

   } else // this isn't the same person who used the command: create a new reply to the interaction
      await interaction.deferReply({
         ephemeral: true
      });


   // currency shop
   const shopDocRef  = firestore.collection(`currency`).doc(interaction.guild.id);
   const shopDocSnap = await shopDocRef.get();
   const shopDocData = shopDocSnap.data() || {};


   // this user's currency
   const userCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(interaction.user.id);
   const userCurrencyDocSnap = await userCurrencyDocRef.get();
   const userCurrencyDocData = userCurrencyDocSnap.data() || {};


   // items
   const userItem = userCurrencyDocData.item || {};

   const shopItems = shopDocData[`shop-items`] || [];
   const shopItem  = shopItems.find(item =>
      item.ref.isEqual(
         firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(interaction.user.id)
      )
   );

   const hasPersonalItem = !!Object.values(userItem).length;


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(data.colour)
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`currency-items:item`)
               .setLabel(`Go back to your personal item`)
               .setEmoji(`🏷️`)
               .setStyle(Discord.ButtonStyle.Secondary)
         )
   ];


   // no item (or shop item)
   if (!hasPersonalItem || !shopItem) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't increase quantity
            > - You need to create your personal item first.
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // the inputted quantity isn't an integer
   if (isNaN(quantity) || !Number.isSafeInteger(quantity)) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't increase quantity
            > - \`${rawQuantity}\` isn't a valid integer.
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // the inputted quantity is a negative number or 0
   if (quantity <= 0) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't increase quantity
            > - Enter a number greater than or equal to 1.
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // the inputted quantity exceeds the max personal item quantity (50)
   if (shopItem.quantity + quantity > 50) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't increase quantity
            > - You can only stock up to 50 personal items.
            >  - You currently have \`${shopItem.quantity}\` in stock: you can stock \`${50 - shopItem.quantity}\` more.
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // the price to pay
   const price = userItem.price === 1
      ? 1
      : userItem.price <= 3
         ? userItem.price - 1
         : Math.ceil(userItem.price / 4);

   const priceToPay = price * quantity;


   // the user doesn't have enough coins to buy this many
   const userCoins = userCurrencyDocData.coins || 0;

   if (priceToPay > userCoins) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't increase quantity
            > - You need 🪙 \`${priceToPay.toLocaleString()}\` ${priceToPay === 1 ? `coin` : `coins`} to increase this item's quantity by ${quantity}: you have 🪙 \`${userCoins.toLocaleString()}\` ${userCoins === 1 ? `coin` : `coins`}.
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // update this user's currency
   const userExpenditure = {
      coins: priceToPay,
      at: new Timestamp(dayjs().unix(), 0)
   };

   await userCurrencyDocRef.update({
      "24-hour-stats.expenditure": FieldValue.arrayUnion(userExpenditure),
      coins:                       FieldValue.increment(-priceToPay)
   });


   // update this user's personal item's quantity
   shopItem.quantity += quantity;

   await shopDocRef.update({
      "shop-items": shopItems
   });


   // embeds
   embeds[0]
      .setDescription(`### 📦 Quantity increased by \`${quantity}\` for 🪙 \`${priceToPay}\` ${priceToPay === 1 ? `coin` : `coins`}!`)
      .setFooter({
         text: `🪙 ${(userCoins - priceToPay).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
      });


   // edit the interaction
   await interaction.editReply({
      embeds,
      components
   });
};