export const name = "qotd submissions-status";
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
      )
      .filter(qotdDocData => qotdDocData.user === interaction.user.id);


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
            submissions
               .map((submission, i) =>
                  [
                     `${i + 1}. ${formatEmoji(submission)} ${isDenied(submission) ? Discord.strikethrough(`"${formatTitle(submission.description)}"`) : `"${formatTitle(submission.description)}"`}`,
                     ` - Submitted at ${Discord.time(Math.floor(Discord.SnowflakeUtil.timestampFrom(submission.id) / 1000))}`,
                     ...isApproved(submission)
                        ? [ ` - Approximate send date: ${Discord.time(dayjs().startOf(`day`).add(12, `hours`).add(submission.position, `days`).unix(), Discord.TimestampStyles.RelativeTime)}` ]
                        : []
                  ]
                     .join(`\n`)
               )
               .join(`\n`)
            || strip`
               ### 📰 You haven't submitted any ${Discord.channelMention(process.env.FA_ROLE_QOTD)}s yet
               > - Create one with ${emojis.slash_command} ${Discord.chatInputApplicationCommandMention(`qotd`, `create`, interaction.commandId)}
            `
         )
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds
   });
};