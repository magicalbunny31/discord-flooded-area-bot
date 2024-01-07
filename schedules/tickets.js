export const cron = {
   // at every hour
   minute: 0
};

import Discord from "discord.js";
import dayjs from "dayjs";
import { colours, noop, strip, wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {import("discord.js").Client} client
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (client, firestore) => {
   // get the flooded area community guild
   const guild = await client.guilds.fetch(process.env.GUILD_FLOODED_AREA);


   // get active threads
   const { threads } = await guild.channels.fetchActiveThreads();


   // fetch threads in the ticket channels that can have unopened tickets
   const ticketChannelIds = [
      process.env.FA_CHANNEL_REPORT_A_PLAYER
   ];


   // for each ticket channel
   for (const ticketChannelId of ticketChannelIds) {
      // for each thread
      threads.each(async thread => {
         // this thread's parent in't the ticket channel
         if (thread.parent?.id !== ticketChannelId)
            return;


         // this ticket is open (check its name, if it has been changed then oh well!)
         if (![ `📣┃unopened ticket` ].includes(thread.name))
            return;


         // fetch all messages in this thread
         const messages = await (async () => {
            const fetchedMessages = [];
            let lastMessage;

            while (true) {
               const messages = (await thread.messages.fetch({ limit: 100, ...fetchedMessages.length ? { before: fetchedMessages.at(-1).id } : {} }))
                  .filter(message => message.author.id === client.user.id && !message.system && message.embeds?.length && message.components?.length);

               fetchedMessages.push(...messages.values());

               if (lastMessage?.id === fetchedMessages.at(-1)?.id)
                  break;

               else
                  lastMessage = fetchedMessages.at(-1);

               await wait(1000);
            };

            return fetchedMessages;
         })();


         // get the first message, sent by the bot, with embeds and components
         const reportMessage = messages.at(-1);


         // get the reporting user's id from this message
         const reportingUserId = reportMessage?.components[0].components[1]?.data.custom_id.split(`:`)[1];


         // this thread is over a day old, delete it and notify the reporting user
         if (dayjs().diff(thread.createdAt, `day`, true) >= 1) {
            await thread.delete();

            try {
               if (reportingUserId) {
                  const user = await client.users.fetch(reportingUserId);
                  await user.send({
                     embeds: [
                        new Discord.EmbedBuilder()
                           .setColor(colours.flooded_area)
                           .setTitle(`\\📣 Report a Player`)
                           .setDescription(strip`
                              > - Your report has been __deleted due to not being submitted__ for over a day.
                              > - Moderators __may not have taken action__ on your report.
                              > - Next time, make sure to __submit your report__!
                           `)
                           .setFooter({
                              text: guild.name,
                              iconURL: guild.iconURL()
                           })
                     ]
                  });
               };

            } finally {
               return;
            };
         };


         // it's not been an hour since the thread was created
         if (dayjs().diff(thread.createdAt, `hour`, true) < 1)
            return;


         // remind this user to submit their report
         const alert = await thread.send({
            content: strip`
               ### ${Discord.userMention(reportingUserId)}, remember to submit your report!
               > - You can do so by clicking the **📬 Submit report** button at the start of this thread.
               >  - If you don't, the ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} may not be able to take action on your report.
               >  - This thread will be automatically deleted ${Discord.time(dayjs(thread.createdAt).startOf(`hour`).add(1, `hour`).add(1, `day`).unix(), Discord.TimestampStyles.RelativeTime)}.
            `,
            allowedMentions: {
               users: [ reportingUserId ],
               roles: []
            }
         });

         await wait(300000);

         try {
            await alert.delete();
         } catch {
            noop;
         };
      });
   };
};