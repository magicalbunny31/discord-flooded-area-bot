export const name = "qotd queue";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];


import Discord from "discord.js";
import { colours, emojis } from "@magicalbunny31/awesome-utility-stuff";

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


   // data
   const approvedQotds         = submissions.filter(submission =>  submission.approved)                      .length;
   const deniedQotds           = submissions.filter(submission => !submission.approved &&  submission.delete).length;
   const awaitingApprovalQotds = submissions.filter(submission => !submission.approved && !submission.delete).length;


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setAuthor({
            name: `QoTD submissions`,
            iconURL: interaction.guild.iconURL()
         })
         .setFields({
            name: `✅ Approved QoTDs`,
            value: `> \`${approvedQotds.toLocaleString()}\` ${approvedQotds === 1 ? `QoTD` : `QoTDs`}`,
            inline: true
         }, {
            name: `❌ Denied QoTDs (past 7 days)`,
            value: `> \`${deniedQotds.toLocaleString()}\` ${deniedQotds === 1 ? `QoTD` : `QoTDs`}`,
            inline: true
         }, {
            name: `${emojis.loading} QoTDs awaiting approval`,
            value: `> \`${awaitingApprovalQotds.toLocaleString()}\` ${awaitingApprovalQotds === 1 ? `QoTD` : `QoTDs`}`,
            inline: true
         })
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds
   });
};