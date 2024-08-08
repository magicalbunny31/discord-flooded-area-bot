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
   // backup qotds
   const backupQotd = choice(
      [{
         description: `what's the best thing that's happened today?`,
         threadName: `tell us NOW`,
         user: client.application.id
      }, {
         description: `what are you looking forward to do today/week(/month/whatever)?`,
         threadName: `you have nothing important going on in your life right now don't you`,
         user: client.application.id
      }, {
         description: `best way to relax?`,
         threadName: `relaxation advice`,
         user: client.application.id
      }, {
         description: `what was the last thing you ate`,
         threadName: `food`,
         user: client.application.id
      }, {
         description: `what's your go-to comfort food?`,
         threadName: `comfort food`,
         user: client.application.id
      }, {
         description: `what's your favourite season?`,
         threadName: `and why?`,
         reactionChoices: [{
            reactionEmoji: `🌺`,
            reactionName: `spring`
         }, {
            reactionEmoji: `☀️`,
            reactionName: `summer`
         }, {
            reactionEmoji: `🍂`,
            reactionName: `autumn`
         }, {
            reactionEmoji: `❄️`,
            reactionName: `winter`
         }],
         user: client.application.id
      }, {
         description: `if you could travel to anywhere in the world, where would it be and why?`,
         threadName: `i'm going to travel to all of these places`,
         user: client.application.id
      }, {
         description: `what platform do you like playing games on`,
         threadName: `Comments`,
         reactionChoices: [{
            reactionEmoji: `🖥️`,
            reactionName: `pc`
         }, {
            reactionEmoji: `📱`,
            reactionName: `mobile/tablet`
         }, {
            reactionEmoji: `🎮`,
            reactionName: `console`
         }, {
            reactionEmoji: `🔀`,
            reactionName: `other (Tell Us In The Comments Below!)`
         }],
         user: client.application.id
      }, {
         description: `what is your favourite fictional character?`,
         threadName: `mine is husk from hazbin hotel`,
         user: client.application.id
      }, {
         description: `if you were to create a game, what would it be about?`,
         threadName: `roblox devforum`,
         user: client.application.id
      }, {
         description: `what is your favourite soundtrack from a game or show?`,
         threadName: `mine is "loser, baby" from hazbin hotel`,
         user: client.application.id
      }, {
         description: `what is the strangest thing you've eaten?`,
         threadName: `food review`,
         user: client.application.id
      }, {
         description: `if you could learn any new skill, what would it be and why?`,
         threadName: `skill issue`,
         user: client.application.id
      }, {
         description: `you've just learned to time travel but you can only go to the future or the past - which do you choose?`,
         reactionChoices: [{
            reactionEmoji: `⬅️`,
            reactionName: `past`
         }, {
            reactionEmoji: `➡️`,
            reactionName: `future`
         }],
         user: client.application.id
      }, {
         description: `what is your favourite hobby?`,
         threadName: `mine is sitting around and doing nothing`,
         user: client.application.id
      }]
   );


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


      // get a qotd: the first approved submission, or a backup qotd
      const qotdColApprovedDocs = qotdColSnap.docs
         .filter(qotdDocSnap => qotdDocSnap.exists && qotdDocSnap.data().approved);

      const [ qotdDocSnap ] = qotdColApprovedDocs;

      const qotdDocData = qotdDocSnap
         ? qotdDocSnap.data()
         : backupQotd;


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
      await qotdDocSnap?.ref.delete();
   };
};