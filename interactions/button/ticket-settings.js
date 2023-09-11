export const name = "ticket-settings";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button ] = interaction.customId.split(`:`);


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setTitle(`🔧 Ticket Settings`)
         .setDescription(strip`
            ### ${emojis.bun_paw_wave} Hello, ${interaction.user}!
            > - Change your settings for tickets below...
         `)
         .setFooter({
            text: `this needs redoing soon ~bunny` // TODO
         })
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
                     .setEmoji(`🔨`)
                     .setLabel(`Ban appeals`)
                     .setDescription(`Enable or disable ban appeal notifications.`)
                     .setValue(`ban-appeals`)
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