export const name = "currency-shop";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

import Discord from "discord.js";
import dayjs from "dayjs";
import { FieldValue } from "@google-cloud/firestore";
import { emojis, autoArray, deferComponents, strip } from "@magicalbunny31/awesome-utility-stuff";

import shopResponses from "../../data/shop-responses.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, area ] = interaction.customId.split(`:`);


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


   // currency shop
   const shopDocRef  = firestore.collection(`currency`).doc(interaction.guild.id);
   const shopDocSnap = await shopDocRef.get();
   const shopDocData = shopDocSnap.data() || {};


   // this user's currency
   const userCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(interaction.user.id);
   const userCurrencyDocSnap = await userCurrencyDocRef.get();
   const userCurrencyDocData = userCurrencyDocSnap.data() || {};


   // commands
   const commands = await interaction.guild.commands.fetch();
   const commandCurrencyId = commands.find(command => command.name === `currency`)?.id || 0;


   // who's in charge of bunny's shop
   /**
    * halo  : 10:00 - 03:59  |  halo         : 10:00 - 15:59
    *                        |  halo + bunny : 16:00 - 03:59
    * bunny : 16:00 - 09:59  |         bunny : 04:00 - 09:59
    */
   const bunnyShopShopkeeper = (() => {
      const hour = dayjs.utc().hour();
      switch (true) {
         case 10 <= hour && hour < 16: return shopResponses[area].halo;
         default:                      return shopResponses[area].haloBunny;
         case  4 <= hour && hour < 10: return shopResponses[area].    bunny;
      };
   })();


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         })
   ];


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
                     .setDefault(area === `shop-items`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🏬`)
                     .setLabel(`Special items`)
                     .setValue(`special-items`)
                     .setDescription(`🏪 bunny's shop`)
                     .setDefault(area === `special-items`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`💸`)
                     .setLabel(`Flea market`)
                     .setValue(`flea-market`)
                     .setDescription(`🐉 dragon deals`)
                     .setDefault(area === `flea-market`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🥕`)
                     .setLabel(`Stalk market`)
                     .setValue(`stalk-market`)
                     .setDescription(`🧺 your local carrot farm`)
                     .setDefault(area === `stalk-market`)
               )
         )
   ];


   // what area to go to
   switch (area) {


      // shop items
      case `shop-items`: {
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

            return itemsWithItemData;
         })();

         const displayedItems = items.filter(item => item.displayed && item.quantity > 0);


         // embeds
         embeds[0]
            .setColor(bunnyShopShopkeeper.colour)
            .setTitle(`🏪 bunny's shop`)
            .setDescription(bunnyShopShopkeeper.welcome)
            .setFields([
               ...displayedItems.length
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
                  : [{
                     name: `No items to display`,
                     value: strip`
                        > - Wait until the shop refreshes to buy more items.
                        > - Or, how about selling your own items in ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`currency`, `items`, commandCurrencyId)}?
                     `
                  }],
               {
                  name: `\u200b`,
                  value: `🏷️ **Items** refresh ${
                     Discord.time(
                        dayjs
                           .utc()
                           .startOf(`hour`)
                           .add(1, `hours`)
                           .toDate(),
                        Discord.TimestampStyles.RelativeTime
                     )
                  }`
               }
            ]);


         // components
         components.splice(1, 4,
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
                              )
                           : new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(`fox`)
                              .setValue(`fox`)
                     )
                     .setDisabled(!displayedItems.length)
               ),

            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.ButtonBuilder()
                     .setCustomId(`currency-how-shop-works`)
                     .setLabel(`How does the shop work?`)
                     .setEmoji(`❓`)
                     .setStyle(Discord.ButtonStyle.Secondary)
               )
         );


         // break out
         break;
      };


      // special items
      case `special-items`: {
         // items
         const specialItems = shopDocData[`special-items`] || [];


         // embeds
         embeds[0]
            .setColor(bunnyShopShopkeeper.colour)
            .setTitle(`🏪 bunny's shop`)
            .setDescription(bunnyShopShopkeeper.welcome)
            .setFields([
               ...specialItems.length
                  ? specialItems
                     .map(item =>
                        ({
                           name: item.name,
                           value: `> Costs 🪙 \`${item.price.toLocaleString()}\` ${item.price === 1 ? `coin` : `coins`}`,
                           inline: true
                        })
                     )
                     : [{
                        name: `No items to display`,
                        value: `> Check back again later!`
                     }],
               {
                  name: `\u200b`,
                  value: `🏬 **Special items** last updated ${
                     Discord.time(
                        interaction.createdAt,
                        Discord.TimestampStyles.RelativeTime
                     )
                  }`
               }
            ]);


         // components
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`currency-buy-special-item`)
                     .setPlaceholder(`Select an item to buy...`)
                     .setOptions(
                        specialItems.length
                           ? specialItems
                           .map(item =>
                              new Discord.StringSelectMenuOptionBuilder()
                                 .setLabel(item.name)
                                 .setDescription(`🪙 ${item.price.toLocaleString()} coins`)
                                 .setValue(item.name)
                           )
                           : new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(`fox`)
                              .setValue(`fox`)
                     )
                     .setDisabled(!specialItems.length)
               )
         );


         // break out
         break;
      };


      // flea market
      case `flea-market`: {
         // items
         const fleaMarket = shopDocData[`flea-market`] || [];

         const items = (
            await Promise.all(
               fleaMarket
                  .map(async data => {
                     if (data.name) { // cool this item is a name, return it as it was
                        return data;

                     } else { // this item has a DocumentRef
                        const itemDocSnap = await data.ref.get();     // fetch this user's personal item
                        const itemDocData = itemDocSnap.data() || {}; // get their personal item's data

                        if (!Object.values(itemDocData).length) // ok for some reason this user doesn't actually have a personal item
                           return null;

                        else
                           return { // return this item's name in the json too
                              ...data,
                              name: itemDocData.item.name
                           };
                     };
                  })
            )
         )
            .filter(Boolean); // `null` is present if there was no personal item present, just filter those out of the list


         // embeds
         embeds[0]
            .setColor(shopResponses[`flea-market`].ruby.colour)
            .setTitle(`🐉 dragon deals`)
            .setDescription(shopResponses[`flea-market`].ruby.welcome)
            .setFields([
               ...items.length
                  ? items
                     .map(item =>
                        ({
                           name: item.name,
                           value: strip`
                              > From ${Discord.userMention(item.seller)}
                              > Priced at 🪙 \`${item.price.toLocaleString()}\` ${item.price === 1 ? `coin` : `coins`}
                           `,
                           inline: true
                        })
                     )
                  : [{
                     name: `No items to display`,
                     value: `> You can sell one of your items here with ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`currency`, `items`, commandCurrencyId)}.`
                  }],
               {
                  name: `\u200b`,
                  value: `💸 **Flea market** last updated ${
                     Discord.time(
                        interaction.createdAt,
                        Discord.TimestampStyles.RelativeTime
                     )
                  }`
               }
            ]);


         // components
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`currency-buy-flea-market-item`)
                     .setPlaceholder(`Select an item to buy...`)
                     .setOptions(
                        items.length
                           ? items
                              .map(item =>
                                 new Discord.StringSelectMenuOptionBuilder()
                                    .setLabel(item.name)
                                    .setDescription(`🪙 ${item.price.toLocaleString()} coins`)
                                    .setValue(`${item.ref?.id || item.name}:${item.seller}`)
                              )
                           : new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(`fox`)
                              .setValue(`fox`)
                     )
                     .setDisabled(!fleaMarket.length)
               )
         );


         // break out
         break;
      };


      // stalk market
      case `stalk-market`: {
         // the stalk market
         const stalkMarket = shopDocData[`stalk-market`];

         const period = (dayjs.utc().day() - 1) * 2
            + (dayjs.utc().isAfter(dayjs.utc().startOf(`day`).add(12, `hours`)) ? 1 : 0);

         const isBuyingDay = dayjs.utc().day() === 0;

         const carrotsBeforeExpire = userCurrencyDocData.carrots?.quantity || 0;

         const carrotsExpired = userCurrencyDocData.carrots?.[`expires-at`]?.seconds < dayjs().unix();
         const previousCarrotsExpired = carrotsBeforeExpire && carrotsExpired;

         const carrots = !previousCarrotsExpired
            ? carrotsBeforeExpire
            : 0;


         // this user's carrots have expired, put them as their items
         if (carrotsExpired) {
            const { quantity, price } = userCurrencyDocData.carrots;
            const items = userCurrencyDocData.items || [];

            items.push(
               ...autoArray(quantity, () =>
                  ({
                     name:         `Rotten Carrot`,
                     "bought-for": price
                  })
               )
            );

            await userCurrencyDocRef.update({
               items,
               carrots: FieldValue.delete()
            });
         };


         // embeds
         embeds[0]
            .setColor(shopResponses[`stalk-market`].deerie.colour)
            .setTitle(`🧺 your local carrot farm`)
            .setDescription(shopResponses[`stalk-market`].deerie.welcome)
            .setFields({
               name: `🗓️ Today is \`${[ `Sunday`, `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday` ][dayjs.utc().day()]}\``,
               value: isBuyingDay
                  ? strip`
                     > 💳 This week's buy price is 🪙 \`${stalkMarket[`current-price`]}\` coins per 🥕 \`1\` carrot
                     > 💰 You can sell these carrots on \`Monday\`, \`Tuesday\`, \`Wednesday\`, \`Thursday\`, \`Friday\` and \`Saturday\`
                  `
                  : strip`
                     > 💰 Today's sell price is 🪙 \`${stalkMarket.prices[period].toLocaleString()}\` coins per 🥕 \`1\` carrot
                     > 💳 You can buy more carrots on \`Sunday\`
                  `
            }, {
               name: `\u200b`,
               value: strip`
                  🥕 The **stalk market** will refresh ${Discord.time(
                     isBuyingDay
                        ? dayjs.utc().startOf(`day`).add(1, `day`).unix()
                        : dayjs.utc().hour() < 12
                           ? dayjs.utc().startOf(`day`).add(12, `hours`).unix()
                           : dayjs.utc().startOf(`day`).add(1,  `day`)  .unix(),
                     Discord.TimestampStyles.RelativeTime
                  )}
               `
            })
            .setFooter({
               text: strip`
                  ${embeds[0].data.footer.text}
                  🥕 ${
                     !previousCarrotsExpired
                        ? `${carrots.toLocaleString()} ${carrots === 1 ? `carrot` : `carrots`}`
                        : `0 carrots (your previous ${carrotsBeforeExpire.toLocaleString()} ${carrotsBeforeExpire === 1 ? `carrot` : `carrots`} became rotten!)`
                  } 
               `
            });


         // components
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  isBuyingDay
                     ? new Discord.ButtonBuilder()
                        .setCustomId(`currency-stalk-market:buy-carrots`)
                        .setLabel(`Buy carrots`)
                        .setEmoji(`💳`)
                        .setStyle(Discord.ButtonStyle.Success)
                     : new Discord.ButtonBuilder()
                        .setCustomId(`currency-stalk-market:sell-carrots`)
                        .setLabel(`Sell carrots`)
                        .setEmoji(`💰`)
                        .setStyle(Discord.ButtonStyle.Success)
               ),

            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.ButtonBuilder()
                     .setCustomId(`currency-how-stalk-market-works`)
                     .setLabel(`How does the stalk market work?`)
                     .setEmoji(`❓`)
                     .setStyle(Discord.ButtonStyle.Secondary)
               )
         );


         // break out
         break;
      };


   };


   // edit the deferred interaction
   await interaction.editReply({
      embeds,
      components
   });
};