export const name = Discord.Events.GuildMemberAdd;


import Discord from "discord.js";
import { Timestamp } from "@google-cloud/firestore";

/**
 * @param {Discord.GuildMember} member
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (member, firestore) => {
   // this member isn't from these guilds
   if (![ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ].includes(member.guild.id))
      return;


   // database
   const whoJoinedAtDocRef  = firestore.collection(`who-joined-at`).doc(member.guild.id);
   const whoJoinedAtDocSnap = await whoJoinedAtDocRef.get();
   const whoJoinedAtDocData = whoJoinedAtDocSnap.data() || {};


   // this member is already in the data
   if (member.id in whoJoinedAtDocData)
      return;


   // add this member to the data
   await whoJoinedAtDocRef.update({
      [member.id]: new Timestamp(
         Math.floor(member.joinedTimestamp / 1000),
         0
      )
   });
};