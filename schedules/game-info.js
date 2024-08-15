export const cron = `0,30 * * * *`; // at every half hour

import dayjs from "dayjs";
import { FieldValue } from "@google-cloud/firestore";

import pkg from "../package.json" assert { type: "json" };

/**
 * @param {import("discord.js").Client} client
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (client, firestore) => {
   // current timestamp
   const timestamp = dayjs().startOf(`minute`).unix();


   // universe ids to check
   const universes = [{
      name: `flooded-area`,
      id: 1338193767
   }, {
      name: `spaced-out`,
      id: 4746031883
   }, {
      name: `darkness-obby`,
      id: 5745236823
   }, {
      name: `anarchy-chess`,
      id: 5778315325
   }];


   // user-agent string
   const userAgent = `${pkg.name}/${pkg.version} (https://nuzzles.dev/area-communities-bot)`;


   // fetch info on these games
   // https://games.roblox.com/docs/index.html?urls.primaryName=Games%20Api%20v1
   const games = await (async () => {
      const response = await fetch(`https://games.roblox.com/v1/games?universeIds=${universes.map(universe => universe.id).join(`,`)}`, {
         headers: {
            "Accept": `application/json`,
            "User-Agent": userAgent
         }
      });

      if (response.ok)
         return (await response.json()).data;

      else
         return null;
   })();

   // https://games.roblox.com/docs/index.html?urls.primaryName=Games%20Api%20v1
   const votes = await (async () => {
      const response = await fetch(`https://games.roblox.com/v1/games/votes?universeIds=${universes.map(universe => universe.id).join(`,`)}`, {
         headers: {
            "Accept": `application/json`,
            "User-Agent": userAgent
         }
      });

      if (response.ok)
         return (await response.json()).data;

      else
         return null;
   })();



   // for each data, set it in the database
   for (const game of games) {
      // get the votes for this game
      const vote = votes.find(universe => universe.id === game.id);

      // this game's document reference
      const gameDocRef = firestore
         .collection(`historical-game-data`)
         .doc(universes.find(universe => universe.id === game.id).name);

      // add this fetched data to the database
      await gameDocRef
         .update({
            [timestamp]: {
               "current-players": game.playing        || 0,
               "favourites":      game.favoritedCount || 0,
               "total-visits":    game.visits         || 0,
               "votes": {
                  "up":   vote.upVotes   || 0,
                  "down": vote.downVotes || 0
               }
            }
         });

      // fetch this game's data
      const gameDocSnap = await gameDocRef.get();
      const gameDocData = gameDocSnap.data() || {};

      // get timestamp keys to filter out (24hr)
      const keysToFilterData = {};

      Object.keys(gameDocData)
         .filter(timestamp => timestamp <= dayjs().startOf(`minute`).subtract(1, `day`).unix())
         .forEach(timestamp => keysToFilterData[timestamp] = FieldValue.delete());

      if (Object.keys(keysToFilterData).length)
         await gameDocRef
            .update(keysToFilterData);
   };
};