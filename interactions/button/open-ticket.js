import Discord from "discord.js";
import { colours, strip, wait } from "@magicalbunny31/awesome-utility-stuff";
import { FieldValue } from "@google-cloud/firestore";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, proofNeeded ] = interaction.customId.split(`:`);


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // roles
   const { role: moderationTeam } = (await firestore.collection(`role`).doc(`moderation-team`).get()).data();


   // this is not a thread with the parent as the report a player channel
   const { channel: reportAPlayer } = (await firestore.collection(`channel`).doc(`report-a-player`).get()).data();

   if (!interaction.channel.isThread() || interaction.channel.parent?.id !== reportAPlayer) {
      await interaction.deleteReply();
      await interaction.message.delete();
      return;
   };


   // this is not the reporting user
   const { deleteMessagesOnOpen, reason, reportingUser } = (await firestore.collection(`report-a-player`).doc(interaction.channel.id).get()).data();

   if (interaction.user.id !== reportingUser)
      return await interaction.editReply({
         content: `❌ Only the user who created this ticket (${Discord.userMention(reportingUser)}) can open this ticket.`
      });


   // proof is required, check for it
   if (proofNeeded === `true`) {
      // fetch all messages sent by the reporting user in the thread
      const messages = await (async () => {
         const fetchedMessages = [];
         let lastMessage;

         while (true) {
            const messages = (await interaction.channel.messages.fetch({ limit: 100, ...fetchedMessages.length ? { before: fetchedMessages.at(-1).id } : {} }))
               .filter(message => message.author.id === interaction.user.id && !message.system);

            fetchedMessages.push(...messages.values());

            if (lastMessage?.id === fetchedMessages.at(-1)?.id)
               break;

            else
               lastMessage = fetchedMessages.at(-1);

            await wait(1000);
         };

         return fetchedMessages;
      })();


      // none of the messages sent have attachments
      if (
         !messages.some(message =>
            message.attachments.some(attachment =>
               [ `image`, `video` ].some(type =>
                  attachment.contentType.startsWith(type)
               )
            )
         )
         && !messages.some(message =>
            message.embeds.some(embed =>
               embed.image || embed.video
            )
         )
      )
         return await interaction.editReply({
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(colours.red)
                  .setAuthor({
                     name: interaction.user.username,
                     iconURL: interaction.user.avatarURL({
                        extension: `png`,
                        size: 4096
                     })
                  })
                  .addFields({
                     name: `❌ Cannot open ticket`,
                     value: strip`
                        > You must send at least 1 image/video as evidence in this thread before you can open the ticket.
                        > There are no chat logs, so do not rely on that!
                        > Examples of sufficient evidence are images or video clips: just text is __not__ valid evidence.
                        > You can also use third-party sites that embed content as images/videos (like ${Discord.hyperlink(`Streamable`, `https://streamable.com`)}, ${Discord.hyperlink(`Medal`, `https://medal.tv`)}, ${Discord.hyperlink(`ShareX`, `https://getsharex.com`)}...).
                        > Without evidence, the ${Discord.roleMention(moderationTeam)} may not be able to do anything.
                        > If you constantly create reports without sufficient evidence, you may be blocked from ${Discord.channelMention(reportAPlayer)}.
                     `
                  })
            ]
         });
   };


   // edit the report message
   const reportMessage = await (async () => {
      const fetchedMessages = [];
      let lastMessage;

      while (true) {
         const messages = (await interaction.channel.messages.fetch({ limit: 100, ...fetchedMessages.length ? { before: fetchedMessages.at(-1).id } : {} }))
            .filter(message => message.author.id === interaction.client.user.id && message.embeds.length === 2 && !message.system);

         fetchedMessages.push(...messages.values());

         if (lastMessage?.id === fetchedMessages.at(-1)?.id)
            break;

         else
            lastMessage = fetchedMessages.at(-1);

         await wait(1000);
      };

      return fetchedMessages.at(-1);
   })();

   if (reportMessage)
      await reportMessage.edit({
         embeds: [
            reportMessage.embeds[0]
         ],
         components: [
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.ButtonBuilder()
                     .setCustomId(`close-ticket`)
                     .setLabel(`Close ticket`)
                     .setEmoji(`💣`)
                     .setStyle(Discord.ButtonStyle.Danger)
               )
         ]
      });


   // delete these messages
   for (const id of deleteMessagesOnOpen) {
      const message = await interaction.channel.messages.fetch(id);

      try {
         await message.delete();
      } catch {
         continue;
      };
   };


   // change this thread's name
   await firestore.collection(`report-a-player`).doc(`ticket-count`).update({
      count: FieldValue.increment(1)
   });

   const { count } = (await firestore.collection(`report-a-player`).doc(`ticket-count`).get()).data();

   await interaction.channel.setName(`🎫┃ticket #${count}`);

   await firestore.collection(`report-a-player`).doc(interaction.channel.id).update({
      id: count,
      openedAt: interaction.createdTimestamp
   });


   // get the moderators to mention
   const members = await (async () => {
      const fetchedMembers = [];
      let lastMember;

      while (true) {
         const members = (await interaction.guild.members.list({ limit: 1000, ...fetchedMembers.length ? { after: fetchedMembers.at(-1).id } : {} }))
            .filter(member => member.roles.cache.has(moderationTeam));

         fetchedMembers.push(...members.values());

         if (lastMember?.id === fetchedMembers.at(-1)?.id)
            break;

         else
            lastMember = fetchedMembers.at(-1);

         await wait(1000);
      };

      return fetchedMembers;
   })();

   const membersToMention = reason !== `other`
      ? (
         await Promise.all(
            members.map(async member => {
               const { members = [], mentions = [] } = (await firestore.collection(`ticket-settings`).doc(member.id).get()).data() || {};
               return {
                  member,
                  mention: (!members.includes(interaction.user.id))        // this member is muted
                     &&    (!mentions.length || mentions.includes(reason)) // this moderator doesn't want to be mentioned for this ticket reason
               };
            })
         )
      )
         .filter(({ mention }) => mention)
         .map(({ member }) => member)
      : members;

   const roleToMention = await interaction.guild.roles.create({
      name: `Moderation Team`
   });

   for (const member of membersToMention)
      await member.roles.add(roleToMention);

   const mentionMessage = await interaction.channel.send({
      content: strip`
         📣 Report a Player
         > ${roleToMention}
      `
   });

   await mentionMessage.delete();
   await roleToMention.delete();


   // edit the deferred interaction
   return await interaction.editReply({
      content: strip`
         ✅ ${interaction.channel} opened!
         👥 Users in this ticket with the ${Discord.roleMention(moderationTeam)} role will be able to handle this report.
      `,
      allowedMentions: {
         parse: []
      }
   });
};