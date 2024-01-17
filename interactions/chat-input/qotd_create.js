export const name = "qotd create";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];


import Discord from "discord.js";
import { colours, choice, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // embeds
   const embedColour = interaction.user.accentColor || (await interaction.user.fetch(true)).accentColor || choice([ colours.red, colours.orange, colours.yellow, colours.green, colours.blue, colours.purple, colours.pink ]);

   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(embedColour)
         .setAuthor({
            name: `${interaction.user.displayName === interaction.user.username ? `@${interaction.user.username}` : `${interaction.user.displayName} (@${interaction.user.username})`} asks...`,
            iconURL: interaction.user.displayAvatarURL()
         })
         .setFooter({
            text: strip`
               📝 You need to have [question] and at least one of [discussion thread, reaction choices] to submit this QoTD
               📥 Once submitted, you won't be able to edit this QoTD again
               🚨 Staff will review your submitted QoTD before it gets posted
            `
         })
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`qotd-create:${interaction.id}`)
               .setLabel(`Submit QoTD`)
               .setEmoji(`✅`)
               .setStyle(Discord.ButtonStyle.Success)
               .setDisabled(true)
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`qotd-edit:${interaction.id}:content`)
               .setLabel(`Add question`)
               .setEmoji(`➕`)
               .setStyle(Discord.ButtonStyle.Primary)
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`qotd-edit:${interaction.id}:thread`)
               .setLabel(`Add discussion thread`)
               .setEmoji(`➕`)
               .setStyle(Discord.ButtonStyle.Primary)
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`qotd-edit:${interaction.id}:reactions`)
               .setPlaceholder(`Reaction choices`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Add reaction choice`)
                     .setValue(`add`)
                     .setEmoji(`➕`)
               )
         )
   ];


   // reply to the interaction
   await interaction.reply({
      embeds,
      components,
      ephemeral: true
   });
};