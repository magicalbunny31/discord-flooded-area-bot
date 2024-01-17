export const cron = {
   // at every 12:00
   hour: 12,
   minute: 0
};

import Discord from "discord.js";
import { colours, choice, noop } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {import("discord.js").Client} client
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (client, firestore) => {
   // fetch approved submissions
   const qotdColRef  = firestore.collection(`qotd`);
   const qotdColSnap = await qotdColRef.get();

   const qotdColDocs = qotdColSnap.docs
      .filter(qotdDocSnap => qotdDocSnap.exists && qotdDocSnap.data().approved);


   // no approved submissions
   if (!qotdColDocs.length)
      return;


   // get the first doc
   const [ qotdDocSnap ] = qotdColDocs;
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
   const guild   = await client.guilds.fetch(process.env.GUILD_FLOODED_AREA);
   const channel = await guild.channels.fetch(process.env.FA_CHANNEL_QOTD);

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


   // delete the submission from the qotd submissions channel
   try {
      const submissionChannel = await guild.channels.fetch(process.env.FA_ROLE_QOTD_SUBMISSIONS);
      const submissionMessage = await submissionChannel.messages.fetch(qotdDocData.message);

      await submissionMessage.delete();

   } catch {
      noop;
   };
};