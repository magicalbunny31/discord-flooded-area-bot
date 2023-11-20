export const name = "close-ticket";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import { colours, strip, noop } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal info
   const [ _modal, reportingUserId, ticketNumber ] = interaction.customId.split(`:`);


   // fields
   const reason = interaction.fields.getTextInputValue(`reason`).trim();


   // no reason
   if (!reason)
      return await interaction.reply({
         embeds: [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setTitle(`❌ Cannot close ticket`)
               .setDescription(`> - You must input a reason.`)
         ],
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // log this ticket
   const ticketLogs = await interaction.guild.channels.fetch(process.env.FA_CHANNEL_TICKET_LOGS);

   const logEmbed = new Discord.EmbedBuilder()
      .setColor(colours.flooded_area)
      .setTitle(strip`
         ${interaction.channel.parent?.id === process.env.FA_CHANNEL_REPORT_A_PLAYER ? `📣 Report a Player` : `🔨 Ban Appeals`}
         🎫 Ticket #${ticketNumber} Closed
      `)
      .addFields({
         name: `📣 Opened By`,
         value: `> ${Discord.userMention(reportingUserId)}`,
         inline: true
      }, {
         name: `⌚ Opened At`,
         value: `> ${Discord.time(interaction.channel.createdAt)}`,
         inline: true
      }, {
         name: `🔒 Closed By`,
         value: `> ${interaction.user}`,
         inline: true
      }, {
         name: `📝 Reason`,
         value: `>>> ${reason}`
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

   const logMessage = await ticketLogs.send({
      embeds: [
         logEmbed
      ],
      components
   });


   // send the ticket close embed in the thread channel
   await interaction.channel.send({
      embeds: [
         logEmbed
      ]
   });


   // close the thread
   await interaction.channel.setLocked(true);
   await interaction.channel.setArchived(true);


   try {
      // dm the person who opened the ticket
      const user = await interaction.client.users.fetch(reportingUserId);
      await user.send({
         embeds: [
            logEmbed
               .setFooter({
                  text: interaction.guild.name,
                  iconURL: interaction.guild.iconURL()
               })
         ],
         components
      });

   } catch {
      // couldn't send the dm
      noop;
   };


   // edit the deferred interaction
   await interaction.editReply({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setTitle(`🔒 Ticket #${ticketNumber} closed!`)
            .setDescription(`> - It has been logged to ${logMessage.url}.`)
      ]
   });
};