export const cron = {
   // run every day at 00:00
   minute: 0,
   hour: 0
};

import Keyv from "keyv";
import { KeyvFile } from "keyv-file";

/**
 * @param {import("discord.js").Client} client
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (client, firestore) => {
   // guilds to fetch
   const guilds = [
      process.env.GUILD_FLOODED_AREA,
      process.env.GUILD_SPACED_OUT
   ];


   // data to fetch
   const data = [
      `currency`,
      `levels`
   ];


   // for each guild..
   for (const guild of guilds) {


      // for each data..
      for (const section of data) {


         // keyv
         const keyv = new Keyv({
            store: new KeyvFile({
               filename: `./database/leaderboards/${section}.json`
            })
         });

         // fetch documents
         const { docs } = await firestore.collection(section).doc(guild).collection(`users`).get();

         // data fetched from the documents
         const data = Object.assign({},
            ...docs.map(doc =>
               ({
                  [doc.id]: doc.data()
               })
            )
         );

         // set the data into the leaderboards database
         await keyv.set(guild, data);


      };


   };
};