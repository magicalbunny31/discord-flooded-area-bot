export const name = "close-ticket";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import { colours } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, reportingUserId, ticketNumber, confirmed ] = interaction.customId.split(`:`);


   // not a thread in report a player or ban appeals
   if (!interaction.channel.isThread() || ![ process.env.FA_CHANNEL_REPORT_A_PLAYER, process.env.FA_CHANNEL_BAN_APPEALS ].includes(interaction.channel.parent?.id))
      return;


   // already confirmed to close
   if (confirmed === `true`)
      return await interaction.channel.delete();


   // only staff can close tickets
   if (!interaction.member.roles.cache.has(process.env.FA_ROLE_MODERATION_TEAM))
      return await interaction.reply({
         embeds: [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setTitle(`❌ Cannot close ticket`)
               .setDescription(`> - Only a member of the ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} can close tickets.`)
         ],
         ephemeral: true
      });


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`close-ticket:${reportingUserId}:${ticketNumber}`)
      .setTitle(`🎫 Close ticket #${ticketNumber}`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`reason`)
                  .setLabel(`REASON`)
                  .setPlaceholder(`Why are you closing this ticket?`)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setMaxLength(1000)
                  .setRequired(true)
            )
      );


   // show the modal
   await interaction.showModal(modal);
};