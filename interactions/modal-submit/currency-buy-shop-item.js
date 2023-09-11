export const name = "currency-buy-shop-item";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

import Discord from "discord.js";
import dayjs from "dayjs";
import { FieldValue, Timestamp } from "@google-cloud/firestore";
import { colours, emojis, autoArray, strip } from "@magicalbunny31/awesome-utility-stuff";

import shopResponses from "../../data/shop-responses.js";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal info
   const [ _modal, itemSeller ] = interaction.customId.split(`:`);


   // fields
   const rawQuantityWanted = interaction.fields.getTextInputValue(`quantity`).trim();
   const quantityWanted    = +rawQuantityWanted;


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

      Object.assign(deferComponents[2].components[0].data, {
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


   // shop items
   const shopDocRef  = firestore.collection(`currency`).doc(interaction.guild.id);
   const shopDocSnap = await shopDocRef.get();
   const shopDocData = shopDocSnap.data() || {};

   const [ itemsWithRef, items ] = await (async () => {
      const itemsWithRef      = shopDocData[`shop-items`] || [];
      const itemsWithItemData = [];

      for (let i = itemsWithRef.length - 1; i >= 0; i --) { // decrement loop to remove values
         const item = itemsWithRef[i];

         const itemDocRef  = item.ref;
         const itemDocSnap = await itemDocRef.get();
         const itemDocData = itemDocSnap.data() || {};

         if (!(itemDocData.item?.name && itemDocData.item?.price)) {
            itemsWithRef.splice(i, 1);
            continue;
         };

         itemsWithItemData.push({
            ...item,
            ref: undefined,
            name: itemDocData.item.name,
            price: itemDocData.item.price
         });
      };

      if (itemsWithRef.length !== itemsWithItemData.length)
         await shopDocRef.update({
            "shop-items": itemsWithRef
         });

      return [ itemsWithRef, itemsWithItemData ];
   })();


   // this user's currency
   const userCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(interaction.user.id);
   const userCurrencyDocSnap = await userCurrencyDocRef.get();
   const userCurrencyDocData = userCurrencyDocSnap.data() || {};


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
               .setCustomId(`currency-shop:shop-items`)
               .setLabel(`Go back to bunny's shop`)
               .setEmoji(`🏪`)
               .setStyle(Discord.ButtonStyle.Secondary)
         )
   ];


   // this item's name
   const itemName = await (async () => {
      const itemSellerCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(itemSeller);
      const itemSellerCurrencyDocSnap = await itemSellerCurrencyDocRef.get();
      const itemSellerCurrencyDocData = itemSellerCurrencyDocSnap.data() || {};

      const item = itemSellerCurrencyDocData.item || {};
      return item.name;
   })();


   // this seller's personal item doesn't exist
   if (!itemName) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't buy item.
            > - This seller's personal item no longer exists.
         `)
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         });

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // this item's information
   const item = items.find(item => item.name === itemName && item.seller === itemSeller);


   // this item doesn't exist
   if (!item) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't buy item.
            > - This item no longer exists.
            > - It may have run out of stock already, or expired before you could've bought it.
         `)
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         });

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // the inputted value isn't an integer
   if (isNaN(quantityWanted) || !Number.isSafeInteger(quantityWanted)) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't buy item.
            > - \`${rawQuantityWanted}\` isn't a valid integer.
         `)
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         });

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // the inputted value is a negative number or 0
   if (quantityWanted <= 0) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't buy item.
            > - Enter a number greater than or equal to 1.
         `)
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         });

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // the inputted value is more than the current quantity
   if (item.quantity < quantityWanted) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't buy item.
            > - There ${item.quantity === 1 ? `is` : `are`} only ${item.quantity} of this item left: you have inputted \`${quantityWanted}\`.
         `)
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         });

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // current shop tax rate
   const taxRate             = shopDocSnap.data()[`tax-rate`];
   const taxRateAsPercentage = `${(taxRate * 100).toFixed(0)}%`;


   // the price to pay
   const priceToPay = item.price * quantityWanted;

   const taxedCoins    = Math.ceil (priceToPay * taxRate);
   const coinsReceived = Math.floor(priceToPay * (1 - taxRate));


   // the user doesn't have enough coins to buy this many
   const userCoins = userCurrencyDocData.coins || 0;

   if (priceToPay > userCoins) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't buy item.
            > - You need 🪙 \`${priceToPay.toLocaleString()}\` ${priceToPay === 1 ? `coin` : `coins`} to buy \`${quantityWanted}\` of this item.
         `)
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         });

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // update this item
   itemsWithRef
      .find(item => item.seller === itemSeller)
      .quantity -= quantityWanted;

   await shopDocRef.update({
      "shop-items": itemsWithRef
   });


   // update this user's currency
   const userExpenditure = {
      coins: priceToPay,
      at: new Timestamp(dayjs().unix(), 0)
   };

   const userItems = userCurrencyDocData.items || [];
   userItems.push(
      ...autoArray(quantityWanted, () =>
         ({
            "bought-for": item.price,
            ref:          firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(itemSeller)
         })
      )
   );

   await userCurrencyDocRef.update({
      "24-hour-stats.expenditure": FieldValue.arrayUnion(userExpenditure),
      coins:                       FieldValue.increment(-priceToPay),
      items:                       userItems
   });


   // update the seller's currency
   const sellerCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(item.seller);

   const sellerIncome = {
      coins: coinsReceived,
      at: new Timestamp(dayjs().unix(), 0)
   };

   await sellerCurrencyDocRef.update({
      "24-hour-stats.income": FieldValue.arrayUnion(sellerIncome),
      coins:                  FieldValue.increment(coinsReceived)
   });


   // update the tax-to-user's currency
   const taxToUser                = shopDocSnap.data()[`tax-to-user`];
   const taxToUserCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(taxToUser);

   const taxToUserIncome = {
      coins: taxedCoins,
      at: new Timestamp(dayjs().unix(), 0)
   };

   await taxToUserCurrencyDocRef.update({
      "24-hour-stats.income": FieldValue.arrayUnion(taxToUserIncome),
      coins:                  FieldValue.increment(taxedCoins)
   });


   // who's in charge of bunny's shop
   /**
    * halo  : 10:00 - 03:59  |  halo         : 10:00 - 15:59
    *                        |  halo + bunny : 16:00 - 03:59
    * bunny : 16:00 - 09:59  |         bunny : 04:00 - 09:59
    */
   const bunnyShopShopkeeper = (() => {
      const hour = dayjs.utc().hour();
      switch (true) {
         case 10 <= hour && hour < 16: return shopResponses[`special-items`].halo;
         default:                      return shopResponses[`special-items`].haloBunny;
         case  4 <= hour && hour < 10: return shopResponses[`special-items`].    bunny;
      };
   })();


   // embeds
   const priceReallyPaid = interaction.user.id === itemSeller ? priceToPay - coinsReceived : priceToPay;

   embeds[0]
      .setColor(bunnyShopShopkeeper.colour)
      .setDescription(strip`
         ### 🛍️ ${quantityWanted === 1 ? item.name : `${quantityWanted} ${item.name}`} bought for 🪙 \`${priceReallyPaid}\` ${priceReallyPaid === 1 ? `coin` : `coins`}!
         >>> ${bunnyShopShopkeeper.purchase}
      `)
      .setFooter({
         text: strip`
            💸 ${taxRateAsPercentage} tax rate
            🪙 ${(userCoins - priceReallyPaid).toLocaleString()} ${(userCoins - priceReallyPaid) === 1 ? `coin` : `coins`}
         `
      });


   // edit the interaction
   await interaction.editReply({
      embeds,
      components
   });
};