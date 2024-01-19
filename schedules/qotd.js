export const cron = {
   // at every 12:00
   hour: 12,
   minute: 0
};

import Discord from "discord.js";
import dayjs from "dayjs";
import { colours, choice } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {import("discord.js").Client} client
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (client, firestore) => {
   // guilds to update
   const guilds = [{
      guildId:   process.env.GUILD_FLOODED_AREA,
      channelId: process.env.FA_CHANNEL_QOTD
   }];


   // for each guild..
   for (const guildData of guilds) {
      // fetch submissions
      const qotdColRef  = firestore.collection(`qotd`).doc(guildData.guildId).collection(`submissions`);
      const qotdColSnap = await qotdColRef.get();


      // delete denied and expired submissions
      const qotdColExpiredDocs = qotdColSnap.docs
         .filter(qotdDocSnap => qotdDocSnap.exists && !qotdDocSnap.data().approved && qotdDocSnap.data().delete?.seconds < dayjs().unix());

      for (const expiredDoc of qotdColExpiredDocs)
         await expiredDoc.ref.delete();


      // no approved submissions
      const qotdColApprovedDocs = qotdColSnap.docs
         .filter(qotdDocSnap => qotdDocSnap.exists && qotdDocSnap.data().approved);

      if (!qotdColApprovedDocs.length)
         return;


      // get the first doc
      const [ qotdDocSnap ] = qotdColApprovedDocs;
      const qotdDocData = qotdDocSnap.data();


      // embeds
      const user = await client.users.fetch(qotdDocData.user, { force: true });
      const embedColour = user.accentColor || choice([ colours.red, colours.orange, colours.yellow, colours.green, colours.blue, colours.purple, colours.pink ]);

      const embeds = [
         new Discord.EmbedBuilder()
            .setColor(embedColour)
            .setAuthor({
               name: `${user.displayName === user.username ? `@${user.username}` : `${user.displayName} (@${user.username})`} asks...`,
               iconURL: user.displayAvatarURL()
            })
      ];

      if (qotdDocData.description)
         embeds[0].setDescription(qotdDocData.description);

      if (qotdDocData.imageUrl)
         embeds[0].setImage(qotdDocData.imageUrl);

      if (qotdDocData.reactionChoices?.length)
         embeds[0].setFields({
            name: `\u200b`,
            value: qotdDocData.reactionChoices
               .map(reactionChoice => `> ${reactionChoice.reactionEmoji} ${reactionChoice.reactionName}`)
               .join(`\n`)
         });


      // send the message
      const guild   = await client.guilds.fetch(guildData.guildId);
      const channel = await guild.channels.fetch(guildData.channelId);

      const message = await channel.send({
         content: Discord.roleMention(process.env.FA_ROLE_QOTD),
         embeds
      });

      if (qotdDocData.threadName)
         await message.startThread({
            name: qotdDocData.threadName
         });

      if (qotdDocData.reactionChoices?.length)
         for (const reactionChoice of qotdDocData.reactionChoices)
            await message.react(reactionChoice.reactionEmoji);


      // delete the submission from the database
      await qotdDocSnap.ref.delete();
   };
};