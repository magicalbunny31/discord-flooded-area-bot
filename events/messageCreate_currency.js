export const name = Discord.Events.MessageCreate;
export const once = false;


import Discord from "discord.js";
import dayjs from "dayjs";

import { FieldValue, Timestamp } from "@google-cloud/firestore";

/**
 * @param {Discord.Message} message
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (message, firestore) => {
   // ignore messages from bots/webhooks
   if (message.author.bot || message.webhookId)
      return;


   // ignore messages not from flooded area community
   if (message.guild?.id !== process.env.GUILD_FLOODED_AREA)
      return;


   // this user is on cooldown for earning coins
   const database = firestore.collection(`currency`).doc(message.author.id);
   const canEarnCoin = ((await database.get()).data()?.[`can-earn-coins-at`].seconds || 0) < dayjs().unix();

   if (!canEarnCoin)
      return;


   // update this user's currency stuff
   const payload = {
      coins: FieldValue.increment(1),
      "can-earn-coins-at": new Timestamp(dayjs().add(1, `minute`).unix(), 0)
   };

   try {
      return await database.update(payload);
   } catch {
      return await database.set(payload);
   };
};