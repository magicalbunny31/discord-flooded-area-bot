export const cron = {
   minute: 0 // run every hour
};

import dayjs from "dayjs";
import { autoArray, choice, number } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {import("discord.js").Client} client
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (client, firestore) => {
   // guilds to update
   const guilds = [
      process.env.GUILD_FLOODED_AREA,
      process.env.GUILD_SPACED_OUT
   ];


   // for each guild..
   for (const guild of guilds) {
      // currency shop
      const shopDocRef  = firestore.collection(`currency`).doc(guild);
      const shopDocSnap = await shopDocRef.get();
      const shopDocData = shopDocSnap.data() || {};

      const items = shopDocData?.[`shop-items`] || [];

      const stalkMarket = shopDocData[`stalk-market`] || {};


      // rotate the shop (every hour)
      if (true) {
         // set all displayed items as false
         for (const item of items)
            item.displayed = false;

         // items to show on this rotation
         const numberOfItemsToDisplay = choice([ 3, 6, 9 ]);
         const itemsToDisplay         = numberOfItemsToDisplay >= items
            ? items
            : choice(items, numberOfItemsToDisplay);

         // set these items in the available items array as displayed
         for (const item of items)
            item.displayed = itemsToDisplay.some(itemToDisplay => itemToDisplay.seller === item.seller);
      };


      // update the stalk market (every sunday midnight)
      // https://nookipedia.com/wiki/Stalk_Market
      if (!dayjs.utc().day() && !dayjs.utc().hour()) {
         const trend = (() => {
            const trendChanceData = {
               "decreasing": [{
                  name:   `decreasing`,
                  chance: (1 / 8).toFixed(5)
               }, {
                  name:   `small-spike`,
                  chance: (2 / 8).toFixed(5)
               }, {
                  name:   `large-spike`,
                  chance: (3 / 8).toFixed(5)
               }, {
                  name:   `random`,
                  chance: (2 / 8).toFixed(5)
               }],
               "small-spike": [{
                  name:   `decreasing`,
                  chance: (1 / 7).toFixed(5)
               }, {
                  name:   `small-spike`,
                  chance: (1 / 7).toFixed(5)
               }, {
                  name:   `large-spike`,
                  chance: (2 / 7).toFixed(5)
               }, {
                  name:   `random`,
                  chance: (3 / 7).toFixed(5)
               }],
               "large-spike": [{
                  name:   `decreasing`,
                  chance: (1 / 6).toFixed(5)
               }, {
                  name:   `small-spike`,
                  chance: (1 / 6).toFixed(5)
               }, {
                  name:   `large-spike`,
                  chance: (1 / 6).toFixed(5)
               }, {
                  name:   `random`,
                  chance: (3 / 6).toFixed(5)
               }],
               "random": [{
                  name:   `decreasing`,
                  chance: (1 / 6).toFixed(5)
               }, {
                  name:   `small-spike`,
                  chance: (2 / 6).toFixed(5)
               }, {
                  name:   `large-spike`,
                  chance: (2 / 6).toFixed(5)
               }, {
                  name:   `random`,
                  chance: (1 / 6).toFixed(5)
               }]
            }[stalkMarket.trend || `random`];

            const smallestChance = Math.min(...trendChanceData.map(data => data.chance));

            const numberOfDecimals = `${smallestChance}`.split(`.`)[1].length;
            const multiplyByThis = Math.pow(10, numberOfDecimals);

            return choice(
               trendChanceData.flatMap(data =>
                  autoArray(Math.floor(data.chance * multiplyByThis), () => data)
               )
            )
               .name;
         })();

         let spikeIndex = 0;
         const trendPrices = {
            "decreasing": (() => {
               const prices = [ number(40, 50) ];
               let [ price ] = prices;

               for (let i = 0; i < 11; i ++) {
                  price -= number(2, 3);
                  prices.push(price);
               };

               return prices;
            })(),

            "small-spike": (() => {
               const prices = [ number(40, 50) ];
               let [ price ] = prices;
               let endPrice;

               spikeIndex = number(1, 7);
               for (let i = 0; i < 11; i ++) {
                  if ([ spikeIndex, spikeIndex + 1, spikeIndex + 2 ].includes(i))
                     price += number(40, 50);
                  else if (i > spikeIndex) {
                     const pricesAfterThis = 11 - i;
                     if (i === spikeIndex + 3)
                        endPrice = number(i * pricesAfterThis, i * pricesAfterThis + i * 5 + 1);
                     const decreaseBy = Math.round(((price - endPrice) / pricesAfterThis) - number(0, 5));
                     price -= decreaseBy;
                  } else
                     price -= number(4, 6);
                  prices.push(price);
               };

               return prices;
            })(),

            "large-spike": (() => {
               const prices = [ number(40, 50) ];
               let [ price ] = prices;
               let endPrice;

               spikeIndex = number(0, 6);
               for (let i = 0; i < 11; i ++) {
                  if (i === spikeIndex)
                     price += number(50, 75);
                  else if (i === spikeIndex + 1)
                     price -= number(25, 50);
                  else if ([ spikeIndex + 2, spikeIndex + 3 ].includes(i))
                     price += number(100, 150);
                  else if (i > spikeIndex) {
                     const pricesAfterThis = 11 - i;
                     if (i === spikeIndex + 4)
                        endPrice = number(i * pricesAfterThis, i * pricesAfterThis + i * 5 + 1);
                     const decreaseBy = Math.round(((price - endPrice) / pricesAfterThis) - number(0, 5));
                     price -= decreaseBy;
                  } else
                     price -= number(4, 6);
                  prices.push(price);
               };

               return prices;
            })(),

            "random": (() => {
               return autoArray(12, () => number(25, 75));
            })()
         }[trend];

         Object.assign(stalkMarket, {
            "current-price":   number(45, 55),
            "news-date-index": spikeIndex,
            "prices":          trendPrices,
            "trend":           trend
         });
      };


      // update the database
      await shopDocRef.update({
         "shop-items":   items,
         "stalk-market": stalkMarket
      });
   };
};