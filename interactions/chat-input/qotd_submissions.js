export const name = "qotd submissions";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];


import Discord from "discord.js";
import dayjs from "dayjs";
import { colours, emojis, choice, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // fetch all submissions
   const qotdColRef  = firestore.collection(`qotd`).doc(interaction.guildId).collection(`submissions`);
   const qotdColSnap = await qotdColRef.get();
   const qotdColDocs = qotdColSnap.docs;

   const submissions = qotdColDocs
      .filter(qotdDocSnap => qotdDocSnap.exists)
      .map((qotdDocSnap, i) =>
         ({
            ...qotdDocSnap.data(),
            id: qotdDocSnap.id,
            position: i
         })
      );

   const approvedSubmissions = submissions
      .filter(submission => submission.approved);

   const userSubmissions = submissions
      .filter(submission => submission.user === interaction.user.id);


   // formatting
   const isApproved = submission => submission.approved;

   const isDenied = submission => !submission.approved && submission.delete;

   const formatEmoji = submission => isApproved(submission)
      ? `✅`
      : isDenied(submission)
         ? `❌`
         : emojis.loading;

   const replaceNewlines = content => content.replace(/[\r\n]+/g, ` `);

   const formatTitle = description => Discord.escapeMarkdown(
      replaceNewlines(description).length > 100
         ? `${replaceNewlines(description).slice(0, 97)}...`
         : replaceNewlines(description)
   );

   const approximateSendDate = position => dayjs().unix() < dayjs().startOf(`day`).add(12, `hours`).unix()
      ? dayjs().startOf(`day`).add(12, `hours`)              .add(position, `days`).toDate()  // before 12:00, choose this day
      : dayjs().startOf(`day`).add(12, `hours`).add(1, `day`).add(position, `days`).toDate(); // after 12:00,  choose next day


   // embeds
   const embedColour = interaction.user.accentColor || (await interaction.user.fetch(true)).accentColor || choice([ colours.red, colours.orange, colours.yellow, colours.green, colours.blue, colours.purple, colours.pink ]);

   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(embedColour)
         .setAuthor({
            name: `Your QoTD submissions`,
            iconURL: interaction.user.displayAvatarURL()
         })
         .setDescription(
            userSubmissions
               .map(submission => {
                  const approvedSubmissionPosition = approvedSubmissions.findIndex(approvedSubmission => approvedSubmission.message === submission.message);
                  return [
                     `### ${formatEmoji(submission)} ${isDenied(submission) ? Discord.strikethrough(`"${formatTitle(submission.description)}"`) : `"${formatTitle(submission.description)}"`}`,
                     `> - Submitted at: ${Discord.time(Math.floor(Discord.SnowflakeUtil.timestampFrom(submission.id) / 1000))}`,
                     ...isApproved(submission)
                        ? [
                           `> - Position in ${emojis.slash_command} ${Discord.chatInputApplicationCommandMention(`qotd`, `queue`, interaction.commandId)}: \`${approvedSubmissionPosition + 1}\` of \`${approvedSubmissions.length}\``,
                           `> - Sending to ${Discord.channelMention(process.env.FA_CHANNEL_QOTD)}: ${Discord.time(approximateSendDate(approvedSubmissionPosition), Discord.TimestampStyles.RelativeTime)}`
                        ]
                        : []
                  ]
                     .join(`\n`);
               })
               .join(`\n`)
            || strip`
               ### 📰 You haven't submitted any ${Discord.channelMention(process.env.FA_CHANNEL_QOTD)}s yet
               > - Create one with ${emojis.slash_command} ${Discord.chatInputApplicationCommandMention(`qotd`, `create`, interaction.commandId)}
            `
         )
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds
   });
};