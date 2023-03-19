import Discord from "discord.js";
import { colours, noop } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal submit info
   const [ _modal ] = interaction.customId.split(`:`);


   // fields
   const reason = interaction.fields.getTextInputValue(`reason`).trim();


   // no reason
   if (!reason)
      return await interaction.reply({
         content: `❌ You must input a reason.`,
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // log this ticket
   const { channel: ticketLogsId } = (await firestore.collection(`channel`).doc(`ticket-logs`).get()).data();
   const ticketLogs = await interaction.guild.channels.fetch(ticketLogsId);

   const { id: ticketId, openedAt, reportingUser } = (await firestore.collection(`report-a-player`).doc(interaction.channel.id).get()).data();

   const logEmbed = new Discord.EmbedBuilder()
      .setColor(colours.flooded_area)
      .setTitle(`Ticket #${ticketId} Closed`)
      .addFields({
         name: `📣 Opened By`,
         value: `> ${Discord.userMention(reportingUser)}`,
         inline: true
      }, {
         name: `⌚ Opened At`,
         value: `> ${Discord.time(Math.floor(openedAt / 1000))}`,
         inline: true
      }, {
         name: `🔒 Closed By`,
         value: `> ${interaction.user}`,
         inline: true
      }, {
         name: `📝 Reason`,
         value: `>>> ${Discord.escapeMarkdown(reason)}`
      });

   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setLabel(`View ticket history`)
               .setEmoji(`📜`)
               .setURL(interaction.channel.url)
               .setStyle(Discord.ButtonStyle.Link)
         )
   ];

   await ticketLogs.send({
      embeds: [
         logEmbed
      ],
      components
   });


   // close the thread
   await interaction.channel.setLocked(true);
   await interaction.channel.setArchived(true);


   try {
      // dm the person who opened the ticket
      const user = await interaction.client.users.fetch(reportingUser);
      await user.send({
         embeds: [
            logEmbed
               .setFooter({
                  text: interaction.guild.name,
                  iconURL: interaction.guild.iconURL({
                     extension: `png`,
                     size: 4096
                  })
               })
         ],
         components
      });

   } catch {
      // couldn't send the dm
      noop;
   };


   // edit the deferred interaction
   return await interaction.editReply({
      content: `🔒 ${interaction.channel} closed!`
   });
};