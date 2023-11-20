export const name = "currency-stalk-market";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

import Discord from "discord.js";
import dayjs from "dayjs";
import { FieldValue, Timestamp } from "@google-cloud/firestore";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

import shopResponses from "../../data/shop-responses.js";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal info
   const [ _modal, type ] = interaction.customId.split(`:`);

   const isBuying = type === `buy-carrots`;


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


   // the stalk market
   const shopDocRef  = firestore.collection(`currency`).doc(interaction.guild.id);
   const shopDocSnap = await shopDocRef.get();
   const shopDocData = shopDocSnap.data() || {};

   const stalkMarket = shopDocData[`stalk-market`];


   // this user's currency
   const userCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(interaction.user.id);
   const userCurrencyDocSnap = await userCurrencyDocRef.get();
   const userCurrencyDocData = userCurrencyDocSnap.data() || {};


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(data.colour)
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         })
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`currency-shop:stalk-market`)
               .setLabel(`Go back to the stalk market`)
               .setEmoji(`🥕`)
               .setStyle(Discord.ButtonStyle.Secondary)
         )
   ];


   // can't buy carrots not on a sunday
   if (isBuying && dayjs.utc().day() !== 0) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't buy carrots
            > - You can only buy carrots on \`Sunday\`s.
            >  - This will be ${Discord.time(dayjs.utc().startOf(`week`).add(1, `week`).toDate(), Discord.TimestampStyles.RelativeTime)}.
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // can't sell carrots on a sunday
   if (!isBuying && dayjs.utc().day() === 0) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't sell carrots
            > - You't sell carrots on \`Sunday\`s.
            >  - Come back again ${Discord.time(dayjs.utc().startOf(`day`).add(1, `day`).toDate(), Discord.TimestampStyles.RelativeTime)}.
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // the inputted value isn't an integer
   if (isNaN(quantity) || !Number.isSafeInteger(quantity)) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't ${isBuying ? `buy` : `sell`} carrots
            > - \`${rawQuantity}\` isn't a valid integer.
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // the inputted value is a negative number or 0
   if (quantity <= 0) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't sell carrots
            > - Enter a number greater than or equal to 1.
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // can't sell this many carrots
   if (!isBuying && quantity > (userCurrencyDocData.carrots?.quantity || 0)) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't sell carrots
            > - You can't sell more carrots than you have: you have 🥕 \`${userCurrencyDocData.carrots?.quantity || 0}\` ${userCurrencyDocData.carrots?.quantity === 1 ? `carrot` : `carrots`}.
            > - Wait until next \`Sunday\` to buy more carrots.
            >  - This will be ${Discord.time(dayjs.utc().startOf(`week`).add(1, `week`).toDate(), Discord.TimestampStyles.RelativeTime)}.
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // the price to pay OR price to sell
   const sellPriceToday = stalkMarket.prices[
      (dayjs.utc().day() - 1) * 2
         + (dayjs.utc().isAfter(dayjs.utc().startOf(`day`).add(12, `hours`)) ? 1 : 0)
   ];

   const price = isBuying
      ? stalkMarket[`current-price`] * quantity
      : sellPriceToday               * quantity;


   // the user doesn't have enough coins to buy this many
   const userCoins = userCurrencyDocData.coins || 0;

   if (isBuying && price > userCoins) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't buy carrots
            > - You need 🪙 \`${price.toLocaleString()}\` coins to buy \`${quantity}\` ${quantity === 1 ? `carrot` : `carrots`}: you have 🪙 \`${userCoins.toLocaleString()}\` ${userCoins === 1 ? `coin` : `coins`}.
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // update this user's currency
   const userIncomeOrExpenditure = {
      coins: price,
      at: new Timestamp(dayjs().unix(), 0)
   };

   await userCurrencyDocRef.update({
      [`24-hour-stats.${isBuying ? `expenditure` : `income`}`]: FieldValue.arrayUnion(userIncomeOrExpenditure),
      coins:                                                    FieldValue.increment(isBuying ? -price   : price),
      "carrots.quantity":                                       FieldValue.increment(isBuying ? quantity : -quantity),
      ...isBuying
         ? {
            "carrots.expires-at": new Timestamp(dayjs.utc().startOf(`day`).add(1, `week`).unix(), 0),
            "carrots.price":      stalkMarket[`current-price`]
         }
         : {}
   });


   // embeds
   embeds[0]
      .setColor(shopResponses[`stalk-market`].deerie.colour)
      .setDescription(strip`
         ### 🥕 \`${quantity.toLocaleString()}\` ${quantity === 1 ? `carrot` : `carrots`} ${isBuying ? `bought` : `sold`} for 🪙 \`${price}\` ${price === 1 ? `coin` : `coins`}!
         >>> ${
            isBuying
               ? shopResponses[`stalk-market`].deerie.buy
               : shopResponses[`stalk-market`].deerie.sell
         }
      `)
      .setFooter({
         text: isBuying
            ? `🪙 ${(userCoins - price).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
            : `🪙 ${(userCoins + price).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
      });


   // edit the interaction
   await interaction.editReply({
      embeds,
      components
   });
};