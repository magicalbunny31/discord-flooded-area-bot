export const name = "currency-buy-shop-item";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

import Discord from "discord.js";
import dayjs from "dayjs";
import { colours, emojis, deferComponents, strip } from "@magicalbunny31/awesome-utility-stuff";

import shopResponses from "../../data/shop-responses.js";

/**
 * @param {Discord.StringSelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu ] = interaction.customId.split(`:`);
   const [ value ] = interaction.values;

   const [ itemSeller ] = value.split(`:`);


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
   // update the message if this is a command reply and this is the same command user as the select menu booper (or if the message is ephemeral)
   const isSameCommandUser = interaction.user.id === interaction.message.interaction?.user.id;
   const isEphemeral = interaction.message.flags.has(Discord.MessageFlags.Ephemeral);

   if (isSameCommandUser || isEphemeral)
      await interaction.update({
         components: deferComponents(interaction.customId, interaction.values, interaction.message.components)
      });

   else // this isn't the same person who used the command: create a new reply to the interaction
      await interaction.deferReply({
         ephemeral: true
      });


   // commands
   const commands = await interaction.guild.commands.fetch();
   const commandCurrencyId = commands.find(command => command.name === `currency`)?.id || 0;


   // items
   const shopDocRef  = firestore.collection(`currency`).doc(interaction.guild.id);
   const shopDocSnap = await shopDocRef.get();
   const shopDocData = shopDocSnap.data() || {};

   const items = await (async () => {
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

         delete item.ref;
         itemsWithItemData.push({
            ...item,
            name: itemDocData.item.name,
            price: itemDocData.item.price
         });
      };

      if (itemsWithRef.length !== itemsWithItemData.length)
         await shopDocRef.update({
            "shop-items": itemsWithRef
         });

      return itemsWithItemData;
   })();

   const displayedItems = items.filter(item => item.displayed && item.quantity > 0);


   // this user's currency
   const userCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(interaction.user.id);
   const userCurrencyDocSnap = await userCurrencyDocRef.get();
   const userCurrencyDocData = userCurrencyDocSnap.data() || {};


   // who's in charge of bunny's shop
   /**
    * halo  : 10:00 - 03:59  |  halo         : 10:00 - 15:59
    *                        |  halo + bunny : 16:00 - 03:59
    * bunny : 16:00 - 09:59  |         bunny : 04:00 - 09:59
    */
   const bunnyShopShopkeeper = (() => {
      const hour = dayjs.utc().hour();
      switch (true) {
         case 10 <= hour && hour < 16: return shopResponses[`shop-items`].halo;
         default:                      return shopResponses[`shop-items`].haloBunny;
         case  4 <= hour && hour < 10: return shopResponses[`shop-items`].    bunny;
      };
   })();


   // embeds
   const embeds = [
      new Discord.EmbedBuilder(interaction.message.embeds[0].data)
         .setFields(
            displayedItems.length
               ? displayedItems
                  .map(item =>
                     ({
                        name: item.name,
                        value: strip`
                           > Sold by ${Discord.userMention(item.seller)}
                           > Costs 🪙 \`${item.price.toLocaleString()}\` ${item.price === 1 ? `coin` : `coins`}
                        `,
                        inline: true
                     })
                  )
               : {
                  name: `No items to display`,
                  value: strip`
                     > - Wait until the shop refreshes to buy more items.
                     > - Or, how about selling your own items in ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`currency`, `items`, commandCurrencyId)}?
                  `
               }
         )
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         })
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
   if (!itemName)
      embeds[0]
         .setColor(data.colour)
         .setDescription(strip`
            ### ❌ Can't view item.
            > - This seller's personal item no longer exists.
         `);


   // this item's information
   const item = items.find(item => item.name === itemName && item.seller === itemSeller);


   // items
   const userItems = userCurrencyDocData.items || [];
   const thisItemOwned = userItems
      .filter(item =>
         item.ref?.isEqual(
            firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(itemSeller)
         )
      )
      .length
      || 0;


   // current shop tax rate
   const taxRate             = shopDocSnap.data()[`tax-rate`];
   const taxRateAsPercentage = `${(taxRate * 100).toFixed(0)}%`;


   // the price to pay
   let priceToPay = item.price;

   const coinsReceived = Math.floor(priceToPay * (1 - taxRate));

   if (item.seller === interaction.user.id)
      priceToPay -= coinsReceived;


   // embeds
   if (item)
      embeds[0]
         .setDescription(bunnyShopShopkeeper.viewing)
         .setFields({
            name: item.name,
            value: strip`
               > - Seller: ${Discord.userMention(item.seller)}
               > - Cost per item: 🪙 ${
                  item.seller === interaction.user.id
                     ? `${Discord.strikethrough(`\`${item.price.toLocaleString()}\` ${item.price === 1 ? `coin` : `coins`}`)} \`${priceToPay.toLocaleString()}\` ${priceToPay === 1 ? `coin` : `coins`}`
                     : `\`${item.price.toLocaleString()}\` ${item.price === 1 ? `coin` : `coins`}`
               }
               > - Quantity: ${item.quantity.toLocaleString()} left
            `
         })
         .setFooter({
            text: strip`
               💸 ${taxRateAsPercentage} tax rate
               📦 ${thisItemOwned} owned
               🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}
            `
         });


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`currency-shop`)
               .setPlaceholder(`Browse the marketplace...`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🏷️`)
                     .setLabel(`Items`)
                     .setValue(`shop-items`)
                     .setDescription(`🏪 bunny's shop`)
                     .setDefault(true),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🏬`)
                     .setLabel(`Special items`)
                     .setValue(`special-items`)
                     .setDescription(`🏪 bunny's shop`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🛍️`)
                     .setLabel(`Flea market`)
                     .setValue(`flea-market`)
                     .setDescription(`🐉 dragon deals`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🥕`)
                     .setLabel(`Stalk market`)
                     .setValue(`stalk-market`)
                     .setDescription(`🧺 your local carrot farm`)
               )
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`currency-buy-shop-item`)
               .setPlaceholder(`Select an item to buy...`)
               .setOptions(
                  displayedItems.length
                     ? displayedItems
                        .map(item =>
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(item.name)
                              .setDescription(`🪙 ${item.price.toLocaleString()} coins`)
                              .setValue(item.seller)
                              .setDefault(item.seller === itemSeller)
                        )
                     : new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`fox`)
                        .setValue(`fox`)
               )
               .setDisabled(!items.length)
         ),

      ...item
         ? [
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.ButtonBuilder()
                     .setCustomId(`currency-buy-shop-item:${item.seller}`)
                     .setLabel(`Buy item`)
                     .setEmoji(`🛍️`)
                     .setStyle(Discord.ButtonStyle.Success)
               )
         ]
         : []
   ];


   // edit the interaction
   await interaction.editReply({
      embeds,
      components
   });
};