import Discord from "discord.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, abandon, confirm ] = interaction.customId.split(`:`);


   // the ticket was abandoned
   if (abandon === `true`) {
      // already confirmed, delete the thread
      if (confirm === `true`)
         return await interaction.channel.delete();


      // defer the interaction
      await interaction.deferReply({
         ephemeral: true
      });


      // this is not a thread with the parent as the report a player channel
      const { channel: reportAPlayer } = (await firestore.collection(`channel`).doc(`report-a-player`).get()).data();

      if (!interaction.channel.isThread() || interaction.channel.parent?.id !== reportAPlayer) {
         await interaction.deleteReply();
         await interaction.message.delete();
         return;
      };


      // this is not the reporting user (and not a staff member too)
      const { reportingUser } = (await firestore.collection(`report-a-player`).doc(interaction.channel.id).get()).data();
      const { role: moderationTeam } = (await firestore.collection(`role`).doc(`moderation-team`).get()).data();

      if (!interaction.member.roles.cache.has(moderationTeam) && interaction.user.id !== reportingUser)
         return await interaction.editReply({
            content: `❌ Only the user who created this ticket (${Discord.userMention(reportingUser)}) can close this ticket.`
         });


      // confirm delete?
      return await interaction.editReply({
         components: [
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.ButtonBuilder()
                     .setCustomId(`close-ticket:true:true`) // 2nd arg: abandon (let the reporting player close + don't log ticket)
                     .setLabel(`Confirm delete?`)
                     .setEmoji(`💥`)
                     .setStyle(Discord.ButtonStyle.Danger)
               )
         ]
      });
   };


   // only staff can close an open ticket
   const { role: moderationTeam } = (await firestore.collection(`role`).doc(`moderation-team`).get()).data();

   if (!interaction.member.roles.cache.has(moderationTeam))
      return await interaction.reply({
         content: `❌ Only a member of the ${Discord.roleMention(moderationTeam)} can close this ticket.`
      });


   // modal
   const { id } = (await firestore.collection(`report-a-player`).doc(interaction.channel.id).get()).data();

   const modal = new Discord.ModalBuilder()
      .setCustomId(`close-ticket`)
      .setTitle(`🎫 Close ticket #${id}`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`reason`)
                  .setLabel(`REASON`)
                  .setPlaceholder(`📝 Why are you closing this ticket?`)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setMaxLength(500)
                  .setRequired(true)
            )
      );


   // show the modal
   return await interaction.showModal(modal);
};