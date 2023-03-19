export const cron = {
   minute: 0 // run every hour
};

import dayjs from "dayjs";

/**
 * @param {import("discord.js").Client} client
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (client, firestore) => {
   // get the flooded area community guild
   const guild = await client.guilds.fetch(process.env.GUILD_FLOODED_AREA);


   // fetch threads in the ticket channels
   const { channel: reportAPlayer } = (await firestore.collection(`channel`).doc(`report-a-player`).get()).data();

   const ticketChannelIds = [
      reportAPlayer
   ];


   // for each ticket channel
   for (const ticketChannelId of ticketChannelIds) {
      // get this channel
      const channel = await guild.channels.fetch(ticketChannelId);


      // get this channel's threads
      const { threads } = await channel.threads.fetch();

      threads.each(async thread => {
         // this ticket is open (check its name, if it has been changed then oh well!)
         if (thread.name !== `🎫┃unopened ticket`)
            return;

         // this thread isn't >1 day old
         if (dayjs().diff(thread.createdAt, `day`, true) < 1)
            return;

         // delete this thread
         await thread.delete();
      });
   };
};