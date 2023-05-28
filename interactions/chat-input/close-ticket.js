export const data = new Discord.SlashCommandBuilder()
   .setName(`close-ticket`)
   .setDescription(`💣 close a report a player or ban appeal ticket`)
   .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageMessages);

export const guildOnly = true;


import Discord from "discord.js";
import { emojis } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // only staff can close an open ticket
   if (!interaction.member.roles.cache.has(process.env.ROLE_MODERATION_TEAM))
      return await interaction.reply({
         content: `❌ Only a member of the ${Discord.roleMention(process.env.ROLE_MODERATION_TEAM)} can use this command.`,
         ephemeral: true
      });


   // this command wasn't run in a ticket channel
   const commandCloseTicketId = (await interaction.guild.commands.fetch()).find(command => command.name === `close-ticket`).id;

   if (!interaction.channel.isThread() || ![ process.env.CHANNEL_REPORT_A_PLAYER, process.env.CHANNEL_BAN_APPEALS ].includes(interaction.channel.parent.id))
      return await interaction.reply({
         content: `❌ You can only ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`close-ticket`, commandCloseTicketId)}s in ${Discord.channelMention(process.env.CHANNEL_REPORT_A_PLAYER)} or ${Discord.channelMention(process.env.CHANNEL_BAN_APPEALS)} threads.`,
         ephemeral: true
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