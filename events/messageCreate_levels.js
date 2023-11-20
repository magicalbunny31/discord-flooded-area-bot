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
   // ignore messages from bots/webhooks/system
   if (message.author.bot || message.webhookId || message.system)
      return;


   // this message isn't from these guilds
   if (![ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ].includes(message.guild?.id))
      return;


   // database
   const userLevelsDocRef  = firestore.collection(`levels`).doc(message.guild.id).collection(`users`).doc(message.author.id);
   const userLevelsDocSnap = await userLevelsDocRef.get();
   const userLevelsDocData = userLevelsDocSnap.data() || {};


   // this user is on cooldown for earning experience
   const canEarnExperience = (userLevelsDocData[`can-earn-experience-at`]?.seconds || 0) < dayjs().unix();

   if (!canEarnExperience)
      return;


   // the experience this user has earned
   const experienceEarned = 1;


   // update the user's currency data
   const data = {
      "can-earn-experience-at": new Timestamp(dayjs().add(5, `seconds`).unix(), 0),
      experience:               FieldValue.increment(experienceEarned)
   };

   if (userLevelsDocSnap.exists)
      await userLevelsDocRef.update(data);
   else
      await userLevelsDocRef.set(data);


   // function to get a level from experience
   const getLevel = experience => Math.floor(Math.sqrt(experience / 10));

   const experience = (userLevelsDocData.experience || 0) + 1;
   const level      = getLevel(experience);


   // role rewards
   const roleRewards = {
      20: [
         process.env.FA_ROLE_IMAGE_EMBED_PERMS
      ]
   };


   // check role rewards
   const rolesToAdd = [];

   for (const key in roleRewards) {
      if (level < key)
         continue;

      const reward = roleRewards[key];

      for (const role of reward) {
         if (!message.member.roles.cache.has(role))
            rolesToAdd.push(role);
      };
   };

   if (rolesToAdd.length)
      await message.member.roles.add(rolesToAdd);
};