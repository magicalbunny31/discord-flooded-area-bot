export const name = "submit-report";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import { FieldValue } from "@google-cloud/firestore";
import { colours, emojis, url, strip, wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, type, reportingUserId, reportMessageId ] = interaction.customId.split(`:`);


   // this isn't the user who created this report
   if (interaction.user.id !== reportingUserId)
      return await interaction.reply({
         embeds: [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setTitle(`❌ Cannot submit report`)
               .setDescription(`> - Only the user who created this report (${Discord.userMention(reportingUserId)}) can submit this report.`)
         ],
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   /* check for proof */

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

   // none of the messages sent have attachments, embeds or urls
   if (
      !messages.some(message =>
         message.attachments?.size || message.embeds?.length || url.test(message.content)
      )
   )
      return await interaction.editReply({
         embeds: [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setTitle(`❌ Cannot submit report`)
               .setDescription(strip`
                  > - You must send at least 1 image/video/link in this thread before you can submit your report.
                  >  - Examples of sufficient evidence are images or video clips: just text is not valid evidence.
                  >  - You can also use third-party sites that embed content as images/videos (like ${Discord.hyperlink(`Streamable`, `https://streamable.com`)}, ${Discord.hyperlink(`Medal`, `https://medal.tv`)}, ${Discord.hyperlink(`ShareX`, `https://getsharex.com`)}...).
                  > - There are no chat logs, so do not rely on that!
                  > - Without evidence, the ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} may not be able to do anything.
                  >  - If you constantly create reports without sufficient evidence, you may be blocked from ${Discord.channelMention(process.env.FA_CHANNEL_REPORT_A_PLAYER)}.
               `)
         ]
      });


   // edit the interaction's reply
   await interaction.editReply({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setTitle(`📣 Report a Player`)
            .setDescription(`${emojis.loading} This'll take a few seconds: your report is being submitted...`)
      ]
   });


   // delete the interaction's original reply
   await interaction.message.delete();


   // change the thread's name
   const ticketsDocRef  = firestore.collection(`tickets`).doc(interaction.guild.id);
   const ticketsDocSnap = await ticketsDocRef.get();
   const ticketsDocData = ticketsDocSnap.data();

   await ticketsDocRef.update({
      "ticket-count": FieldValue.increment(1)
   });
   const currentTicketCount = ticketsDocData[`ticket-count`] + 1;

   await interaction.channel.setName(`📣┃ticket #${currentTicketCount}`);


   // edit the report message's components
   const reportMessage = await interaction.channel.messages.fetch(reportMessageId);

   await reportMessage.edit({
      components: [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(`close-ticket:${interaction.user.id}:${currentTicketCount}`)
                  .setLabel(`Close ticket`)
                  .setEmoji(`💣`)
                  .setStyle(Discord.ButtonStyle.Danger)
            )
      ]
   });


   // get the moderators to mention
   const members = await (async () => {
      const fetchedMembers = [];
      let lastMember;

      while (true) {
         const members = (await interaction.guild.members.list({ limit: 1000, ...fetchedMembers.length ? { after: fetchedMembers.at(-1).id } : {} }))
            .filter(member => member.roles.cache.has(process.env.FA_ROLE_MODERATION_TEAM));

         fetchedMembers.push(...members.values());

         if (lastMember?.id === fetchedMembers.at(-1)?.id)
            break;

         else
            lastMember = fetchedMembers.at(-1);

         await wait(1000);
      };

      return fetchedMembers;
   })();

   const membersToMention = members
      .map(member => {
         const { members = [], mentions = [] } = ticketsDocData.moderators[member.id] || {};
         return {
            member,
            mention: (!members.includes(interaction.user.id))      // this member is muted
               &&    (!mentions.length || mentions.includes(type)) // this moderator doesn't want to be mentioned for this ticket reason
         };
      })
      .filter(({ mention }) => mention)
      .map(({ member }) => member);

   const roleToMention = await interaction.guild.roles.create({
      name: `Moderation Team`
   });

   for (const member of membersToMention)
      await member.roles.add(roleToMention);

   const mentionMessage = await interaction.channel.send({
      content: strip`
         📣 Report a Player > ${
            {
               "false-votekicking":    `Started an invalid votekick`,
               "harassed-people":      `Verbally harassed me or someone else`,
               "threatened-people":    `Threatened violence or real world harm`,
               "hate-speech":          `Promoted hate based on identity or vulnerability`,
               "violence":             `Celebrated or glorified acts of violence`,
               "swore-in-chat":        `Used offensive language`,
               "sexual-in-chat":       `Said something explicit or sexual`,
               "inappropriate-avatar": `Inappropriate avatar`,
               "exploiting":           `Using exploits, cheats, or hacks`,
               "bug-abuse":            `Abusing a bug or glitch to gain an unfair advantage`,
               "sexual-build":         `Built something explicit or sexual`,
               "being-sexual":         `Being suggestive or sexual in-game`,
               "ban-evasion":          `Evading a ban with an alternate account`,
               "moderator-abuse":      `Moderator abusing their powers`,
               "other":                `Another reason...`
            }[type]
         }
         ${roleToMention}
      `,
      files: [
         new Discord.AttachmentBuilder()
            .setFile(`./assets/report-a-player/oh-moderators.gif`)
      ]
   });

   await mentionMessage.delete();
   await roleToMention.delete();


   // bulk delete messages in logs that involve the creation of the fake moderation team role
   // logs take a while to send, so we'll wait about a minute
   setTimeout(async () => {
      const logsChannel = await interaction.guild.channels.fetch(process.env.FA_CHANNEL_LOGS);
      const logsMessages = await logsChannel.messages.fetch({ limit: 100, after: roleToMention.id });

      const dyno = `155149108183695360`;
      const logsWebhooks = await logsChannel.fetchWebhooks();
      const logsDynoWebhook = logsWebhooks.find(webhook => webhook.owner.id === dyno);

      const messagesToDelete = logsMessages
         .filter(message =>
            message.author.id === logsDynoWebhook.id
            && (
               /\*\*<@!?(\d{17,19})> was removed from the `Moderation Team` role\*\*/.test(message.embeds[0]?.description)
               ||
               message.embeds[0]?.footer.text.includes(roleToMention.id)
            )
         );

      if (messagesToDelete.size)
         await logsChannel.bulkDelete(messagesToDelete);

   }, 60 * 1000);


   // edit the interaction's original reply
   await interaction.editReply({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setTitle(`📣 Report a Player`)
            .setDescription(`✅ Thanks for submitting! A member of the ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} will help you with this report soon.`)
      ]
   });


   // support ratings
   await interaction.followUp({
      content: `### 📣 How was the reporting process?`,
      components: [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(`support-ratings:report-a-player:bad`)
                  .setLabel(`Bad`)
                  .setEmoji(emojis.rip)
                  .setStyle(Discord.ButtonStyle.Danger),
               new Discord.ButtonBuilder()
                  .setCustomId(`support-ratings:report-a-player:ok`)
                  .setLabel(`Ok`)
                  .setEmoji(emojis.mhn)
                  .setStyle(Discord.ButtonStyle.Primary),
               new Discord.ButtonBuilder()
                  .setCustomId(`support-ratings:report-a-player:good`)
                  .setLabel(`Good`)
                  .setEmoji(emojis.yaya)
                  .setStyle(Discord.ButtonStyle.Success)
            )
      ],
      ephemeral: true
   });
};