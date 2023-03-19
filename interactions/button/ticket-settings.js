import Discord from "discord.js";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setTitle(`🔧 Ticket Settings`)
         .setDescription(strip`
            ${emojis.bun_paw_wave} **Hello, ${interaction.user}!**
            > Change your settings for tickets below...
         `)
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`ticket-settings-menu`)
               .setPlaceholder(`⚙️ Select a setting...`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`📢`)
                     .setLabel(`Mentions`)
                     .setDescription(`Select what ticket reasons you want to be notified for.`)
                     .setValue(`mentions`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🔕`)
                     .setLabel(`Muted members`)
                     .setDescription(`Mute tickets created by specific members.`)
                     .setValue(`members`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🚫`)
                     .setLabel(`Blacklisted members`)
                     .setDescription(`Blacklist members from creating tickets.`)
                     .setValue(`blacklist`)
               )
         )
   ];


   // reply to the interaction
   return await interaction.reply({
      embeds,
      components,
      ephemeral: true
   });
};