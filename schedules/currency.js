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
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `increasing`,
                  chance: (3 / 16).toFixed(5)
               }, {
                  name:   `small-spike`,
                  chance: (3 / 16).toFixed(5)
               }, {
                  name:   `large-spike`,
                  chance: (2 / 16).toFixed(5)
               }, {
                  name:   `false-spike`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `low-random`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `high-random`,
                  chance: (2 / 16).toFixed(5)
               }, {
                  name:   `starting-mirror`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `ending-mirror`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `peak`,
                  chance: (1 / 16).toFixed(5)
               }],
               "increasing": [{
                  name:   `decreasing`,
                  chance: (2 / 15).toFixed(5)
               }, {
                  name:   `increasing`,
                  chance: (1 / 15).toFixed(5)
               }, {
                  name:   `small-spike`,
                  chance: (2 / 15).toFixed(5)
               }, {
                  name:   `large-spike`,
                  chance: (1 / 15).toFixed(5)
               }, {
                  name:   `false-spike`,
                  chance: (1 / 15).toFixed(5)
               }, {
                  name:   `low-random`,
                  chance: (3 / 15).toFixed(5)
               }, {
                  name:   `high-random`,
                  chance: (2 / 15).toFixed(5)
               }, {
                  name:   `starting-mirror`,
                  chance: (1 / 15).toFixed(5)
               }, {
                  name:   `ending-mirror`,
                  chance: (1 / 15).toFixed(5)
               }, {
                  name:   `peak`,
                  chance: (1 / 15).toFixed(5)
               }],
               "small-spike": [{
                  name:   `decreasing`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `increasing`,
                  chance: (2 / 16).toFixed(5)
               }, {
                  name:   `small-spike`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `large-spike`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `false-spike`,
                  chance: (2 / 16).toFixed(5)
               }, {
                  name:   `low-random`,
                  chance: (3 / 16).toFixed(5)
               }, {
                  name:   `high-random`,
                  chance: (3 / 16).toFixed(5)
               }, {
                  name:   `starting-mirror`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `ending-mirror`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `peak`,
                  chance: (1 / 16).toFixed(5)
               }],
               "large-spike": [{
                  name:   `decreasing`,
                  chance: (2 / 15).toFixed(5)
               }, {
                  name:   `increasing`,
                  chance: (1 / 15).toFixed(5)
               }, {
                  name:   `small-spike`,
                  chance: (1 / 15).toFixed(5)
               }, {
                  name:   `large-spike`,
                  chance: (1 / 15).toFixed(5)
               }, {
                  name:   `false-spike`,
                  chance: (3 / 15).toFixed(5)
               }, {
                  name:   `low-random`,
                  chance: (2 / 15).toFixed(5)
               }, {
                  name:   `high-random`,
                  chance: (2 / 15).toFixed(5)
               }, {
                  name:   `starting-mirror`,
                  chance: (1 / 15).toFixed(5)
               }, {
                  name:   `ending-mirror`,
                  chance: (1 / 15).toFixed(5)
               }, {
                  name:   `peak`,
                  chance: (1 / 15).toFixed(5)
               }],
               "false-spike": [{
                  name:   `decreasing`,
                  chance: (1 / 15).toFixed(5)
               }, {
                  name:   `increasing`,
                  chance: (1 / 15).toFixed(5)
               }, {
                  name:   `small-spike`,
                  chance: (3 / 15).toFixed(5)
               }, {
                  name:   `large-spike`,
                  chance: (1 / 15).toFixed(5)
               }, {
                  name:   `false-spike`,
                  chance: (1 / 15).toFixed(5)
               }, {
                  name:   `low-random`,
                  chance: (2 / 15).toFixed(5)
               }, {
                  name:   `high-random`,
                  chance: (3 / 15).toFixed(5)
               }, {
                  name:   `starting-mirror`,
                  chance: (1 / 15).toFixed(5)
               }, {
                  name:   `ending-mirror`,
                  chance: (1 / 15).toFixed(5)
               }, {
                  name:   `peak`,
                  chance: (1 / 15).toFixed(5)
               }],
               "low-random": [{
                  name:   `decreasing`,
                  chance: (1 / 18).toFixed(5)
               }, {
                  name:   `increasing`,
                  chance: (2 / 18).toFixed(5)
               }, {
                  name:   `small-spike`,
                  chance: (2 / 18).toFixed(5)
               }, {
                  name:   `large-spike`,
                  chance: (3 / 18).toFixed(5)
               }, {
                  name:   `false-spike`,
                  chance: (1 / 18).toFixed(5)
               }, {
                  name:   `low-random`,
                  chance: (1 / 18).toFixed(5)
               }, {
                  name:   `high-random`,
                  chance: (2 / 18).toFixed(5)
               }, {
                  name:   `starting-mirror`,
                  chance: (2 / 18).toFixed(5)
               }, {
                  name:   `ending-mirror`,
                  chance: (2 / 18).toFixed(5)
               }, {
                  name:   `peak`,
                  chance: (2 / 18).toFixed(5)
               }],
               "high-random": [{
                  name:   `decreasing`,
                  chance: (2 / 16).toFixed(5)
               }, {
                  name:   `increasing`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `small-spike`,
                  chance: (3 / 16).toFixed(5)
               }, {
                  name:   `large-spike`,
                  chance: (2 / 16).toFixed(5)
               }, {
                  name:   `false-spike`,
                  chance: (2 / 16).toFixed(5)
               }, {
                  name:   `low-random`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `high-random`,
                  chance: (2 / 16).toFixed(5)
               }, {
                  name:   `starting-mirror`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `ending-mirror`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `peak`,
                  chance: (1 / 16).toFixed(5)
               }],
               "starting-mirror": [{
                  name:   `decreasing`,
                  chance: (2 / 13).toFixed(5)
               }, {
                  name:   `increasing`,
                  chance: (1 / 13).toFixed(5)
               }, {
                  name:   `small-spike`,
                  chance: (1 / 13).toFixed(5)
               }, {
                  name:   `large-spike`,
                  chance: (1 / 13).toFixed(5)
               }, {
                  name:   `false-spike`,
                  chance: (2 / 13).toFixed(5)
               }, {
                  name:   `low-random`,
                  chance: (2 / 13).toFixed(5)
               }, {
                  name:   `high-random`,
                  chance: (1 / 13).toFixed(5)
               }, {
                  name:   `starting-mirror`,
                  chance: (1 / 13).toFixed(5)
               }, {
                  name:   `ending-mirror`,
                  chance: (1 / 13).toFixed(5)
               }, {
                  name:   `peak`,
                  chance: (1 / 13).toFixed(5)
               }],
               "ending-mirror": [{
                  name:   `decreasing`,
                  chance: (2 / 13).toFixed(5)
               }, {
                  name:   `increasing`,
                  chance: (1 / 13).toFixed(5)
               }, {
                  name:   `small-spike`,
                  chance: (1 / 13).toFixed(5)
               }, {
                  name:   `large-spike`,
                  chance: (1 / 13).toFixed(5)
               }, {
                  name:   `false-spike`,
                  chance: (2 / 13).toFixed(5)
               }, {
                  name:   `low-random`,
                  chance: (2 / 13).toFixed(5)
               }, {
                  name:   `high-random`,
                  chance: (1 / 13).toFixed(5)
               }, {
                  name:   `starting-mirror`,
                  chance: (1 / 13).toFixed(5)
               }, {
                  name:   `ending-mirror`,
                  chance: (1 / 13).toFixed(5)
               }, {
                  name:   `peak`,
                  chance: (1 / 13).toFixed(5)
               }],
               "peak": [{
                  name:   `decreasing`,
                  chance: (3 / 16).toFixed(5)
               }, {
                  name:   `increasing`,
                  chance: (2 / 16).toFixed(5)
               }, {
                  name:   `small-spike`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `large-spike`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `false-spike`,
                  chance: (3 / 16).toFixed(5)
               }, {
                  name:   `low-random`,
                  chance: (2 / 16).toFixed(5)
               }, {
                  name:   `high-random`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `starting-mirror`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `ending-mirror`,
                  chance: (1 / 16).toFixed(5)
               }, {
                  name:   `peak`,
                  chance: (1 / 16).toFixed(5)
               }]
            }[stalkMarket.trend || `decreasing`];

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
               const prices = [ number(45, 55) ];
               let [ price ] = prices;

               for (let i = 0; i < 11; i ++) {
                  price -= number(2, 4);
                  prices.push(price);
               };

               return prices;
            })(),

            "increasing": (() => {
               const prices = [ number(25, 35) ];
               let [ price ] = prices;

               for (let i = 0; i < 11; i ++) {
                  price += number(2, 4);
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
                     price -= number(3, 5);
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
                     price -= number(3, 5);
                  prices.push(price);
               };

               return prices;
            })(),

            "false-spike": (() => {
               const prices = [ number(40, 50) ];
               let [ price ] = prices;
               let endPrice;

               spikeIndex = number(0, 6);
               for (let i = 0; i < 11; i ++) {
                  if (i === spikeIndex)
                     price += number(50, 75);
                  else if (i > spikeIndex) {
                     const pricesAfterThis = 11 - i;
                     if (i === spikeIndex + 1)
                        endPrice = number(i * pricesAfterThis, i * pricesAfterThis + i * 5 + 1);
                     const decreaseBy = Math.round(((price - endPrice) / pricesAfterThis) - number(0, 5));
                     price -= decreaseBy;
                  } else
                     price -= number(3, 5);
                  prices.push(price);
               };

               return prices;
            })(),

            "low-random": (() => {
               return autoArray(12, () => number(25, 75));
            })(),

            "high-random": (() => {
               return autoArray(12, () => number(50, 100));
            })(),

            "starting-mirror": (() => {
               const prices = [ number(75, 100) ];
               let [ price ] = prices;
               let endPrice;

               spikeIndex = number(4, 6);
               for (let i = 0; i < 11; i ++) {
                  if (i < spikeIndex) {
                     const pricesToNewsDate = spikeIndex - i;
                     if (i === 0)
                        endPrice = number(16, 36);
                     const decreaseBy = Math.round(((price - endPrice) / pricesToNewsDate) - number(0, 3));
                     price -= decreaseBy;
                  } else if (i >= spikeIndex) {
                     const pricesAfterThis = 11 - i;
                     if (i === spikeIndex)
                        endPrice = number(50, 75);
                     const increaseBy = Math.round(((endPrice - price) / pricesAfterThis) + number(0, 3));
                     price += increaseBy;
                  };
                  prices.push(price);
               };

               return prices;
            })(),

            "ending-mirror": (() => {
               const prices = [ number(50, 75) ];
               let [ price ] = prices;
               let endPrice;

               spikeIndex = number(4, 6);
               for (let i = 0; i < 11; i ++) {
                  if (i < spikeIndex) {
                     const pricesToNewsDate = spikeIndex - i;
                     if (i === 0)
                        endPrice = number(16, 36);
                     const decreaseBy = Math.round(((price - endPrice) / pricesToNewsDate) - number(0, 3));
                     price -= decreaseBy;
                  } else if (i >= spikeIndex) {
                     const pricesAfterThis = 11 - i;
                     if (i === spikeIndex)
                        endPrice = number(75, 100);
                     const increaseBy = Math.round(((endPrice - price) / pricesAfterThis) + number(0, 3));
                     price += increaseBy;
                  };
                  prices.push(price);
               };

               return prices;
            })(),

            "peak": (() => {
               const prices = [ number(30, 40) ];
               let [ price ] = prices;
               let endPrice;

               spikeIndex = number(3, 7);
               for (let i = 0; i < 11; i ++) {
                  if (i < spikeIndex) {
                     const pricesToNewsDate = spikeIndex - i;
                     if (i === 0)
                        endPrice = number(75, 125);
                     const increaseBy = Math.round(((endPrice - price) / pricesToNewsDate) + number(0, 5));
                     price += increaseBy;
                  } else if (i >= spikeIndex) {
                     const pricesAfterThis = 11 - i;
                     if (i === spikeIndex)
                        endPrice = number(30, 40);
                     const decreaseBy = Math.round(((price - endPrice) / pricesAfterThis) - number(0, 5));
                     price -= decreaseBy;
                  };
                  prices.push(price);
               };

               return prices;
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