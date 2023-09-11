export const name = Discord.Events.ThreadUpdate;


import Discord from "discord.js";

/**
 * @param {Discord.ThreadChannel} oldThread
 * @param {Discord.ThreadChannel} newThread
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (oldThread, newThread, firestore) => {
   // this post isn't from a ticket
   if (![ process.env.FA_CHANNEL_REPORT_A_PLAYER, process.env.FA_CHANNEL_BAN_APPEALS ].includes(newThread.parent?.id))
      return;


   // this ticket just opened
   if (oldThread.name === `📣┃unopened ticket` && newThread.name.startsWith(`📣┃ticket #`))
      return;


   // this thread was a named ticket, revert this thread's name
   if ((oldThread.name.startsWith(`📣┃ticket #`) && !newThread.name.startsWith(`📣┃ticket #`)) || (oldThread.name.startsWith(`🔨┃ticket #`) && !newThread.name.startsWith(`🔨┃ticket #`)) || (oldThread.name === `📣┃unopened ticket` && newThread.name !== `📣┃unopened ticket`))
      return await newThread.setName(oldThread.name);


   // this thread was previously archived, archive it again
   if (oldThread.archived && !newThread.archived)
      return await newThread.setArchived(true);
};