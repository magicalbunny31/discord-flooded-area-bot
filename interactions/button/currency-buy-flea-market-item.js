export const name = "currency-buy-flea-market-item";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

import Discord from "discord.js";
import dayjs from "dayjs";
import { FieldValue, Timestamp } from "@google-cloud/firestore";
import { colours, emojis, deferComponents, strip } from "@magicalbunny31/awesome-utility-stuff";

import shopResponses from "../../data/shop-responses.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, itemOriginalSellerOrName, itemSeller ] = interaction.customId.split(`:`);


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

   if (isSameCommandUser || isEphemeral)
      await interaction.update({
         components: deferComponents(interaction.customId, interaction.message.components)
      });

   else // this isn't the same person who used the command: create a new reply to the interaction
      await interaction.deferReply({
         ephemeral: true
      });


   // shop items
   const shopDocRef  = firestore.collection(`currency`).doc(interaction.guild.id);
   const shopDocSnap = await shopDocRef.get();
   const shopDocData = shopDocSnap.data() || {};

   const fleaMarket = shopDocData[`flea-market`] || [];


   // this user's currency
   const userCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(interaction.user.id);
   const userCurrencyDocSnap = await userCurrencyDocRef.get();
   const userCurrencyDocData = userCurrencyDocSnap.data() || {};


   // this item's information
   const item = fleaMarket.find(item => (item.ref?.id || item.name) === itemOriginalSellerOrName && item.seller === itemSeller);

   const itemName = item.name
      || await (async () => {
         const itemSellerCurrencyDocRef  = item.ref;
         const itemSellerCurrencyDocSnap = await itemSellerCurrencyDocRef.get();
         const itemSellerCurrencyDocData = itemSellerCurrencyDocSnap.data() || {};

         const thisItem = itemSellerCurrencyDocData.item || {};
         return thisItem.name;
      })();


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
               .setCustomId(`currency-shop:flea-market`)
               .setLabel(`Go back to dragon deals`)
               .setEmoji(`🐉`)
               .setStyle(Discord.ButtonStyle.Secondary)
         )
   ];


   // this item doesn't exist
   if (!item) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't buy item.
            > - This item no longer exists.
            > - Someone may have bought it before you.
         `)
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         });

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // this user is the seller, remove the listing from the flea market
   if (item.seller === interaction.user.id) {
      // remove this item from the flea market
      fleaMarket.splice(
         fleaMarket.findIndex(item => (item.ref?.id || item.name) === itemOriginalSellerOrName && item.seller === itemSeller),
         1
      );

      await shopDocRef.update({
         "flea-market": fleaMarket
      });

      // update this user's items
      const userItems = userCurrencyDocData.items || [];
      userItems.push({
         ...item.name
            ? { name: item.name }
            : { ref:  item.ref  },
         "bought-for": item[`bought-for`]
      });

      await userCurrencyDocRef.update({
         items: userItems
      });

      // commands
      const commands = await interaction.guild.commands.fetch();
      const commandCurrencyId = commands.find(command => command.name === `currency`)?.id || 0;

      // this item's name
      const itemName = item.name
         ? itemOriginalSellerOrName
         : await (async () => {
            const itemSellerCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(itemOriginalSellerOrName);
            const itemSellerCurrencyDocSnap = await itemSellerCurrencyDocRef.get();
            const itemSellerCurrencyDocData = itemSellerCurrencyDocSnap.data() || {};

            const item = itemSellerCurrencyDocData.item || {};
            return item.name;
         })();

      // embeds
      embeds[0]
         .setDescription(strip`
            ### 💸 \`${itemName}\` returned to your items.
            > - View your items with ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`currency`, `items`, commandCurrencyId)}.
         `);

      // edit the interaction's original reply
      return await interaction.editReply({
         embeds,
         components
      });
   };


   // the price to pay
   const priceToPay = item.price;


   // the user doesn't have enough coins to buy this item
   const userCoins = userCurrencyDocData.coins || 0;

   if (priceToPay > userCoins) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't buy item.
            > - You need 🪙 \`${priceToPay.toLocaleString()}\` ${priceToPay === 1 ? `coin` : `coins`} to buy this item.
         `)
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         });

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // remove this item from the flea market
   fleaMarket.splice(
      fleaMarket.findIndex(item => (item.ref?.id || item.name) === itemOriginalSellerOrName && item.seller === itemSeller),
      1
   );

   await shopDocRef.update({
      "flea-market": fleaMarket
   });


   // update this user's currency
   const userExpenditure = {
      coins: item.price,
      at: new Timestamp(dayjs().unix(), 0)
   };

   const userItems = userCurrencyDocData.items || [];
   userItems.push({
      ...item.name
         ? { name: item.name }
         : { ref:  item.ref  },
      "bought-for": item.price
   });

   await userCurrencyDocRef.update({
      "24-hour-stats.expenditure": FieldValue.arrayUnion(userExpenditure),
      coins:                       FieldValue.increment(-priceToPay),
      items:                       userItems
   });


   // update the seller's currency
   const sellerCurrencyDocRef = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(item.seller);

   const sellerIncome = {
      coins: priceToPay,
      at: new Timestamp(dayjs().unix(), 0)
   };

   await sellerCurrencyDocRef.update({
      "24-hour-stats.income": FieldValue.arrayUnion(sellerIncome),
      coins:                  FieldValue.increment(priceToPay)
   });


   // embeds
   embeds[0]
      .setColor(shopResponses[`flea-market`].ruby.colour)
      .setDescription(strip`
         ### 💸 ${itemName} bought!
         >>> ${shopResponses[`flea-market`].ruby.purchase}
      `)
      .setFooter({
         text: `🪙 ${(userCoins - priceToPay).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
      });


   // edit the interaction
   await interaction.editReply({
      embeds,
      components
   });
};