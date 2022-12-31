export const data = new Discord.SlashCommandBuilder()
   .setName(`currency`)
   .setDescription(`💰 do things with coins`);

export const guildOnly = true;


import Discord from "discord.js";
import { colours, emojis } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // defer the interaction
   await interaction.deferReply();


   // get this user's currency stuffs in the database
   const { coins = 0, items = [] } = (await firestore.collection(`currency`).doc(interaction.user.id).get()).data() || {};


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setAuthor({
            name: interaction.user.tag,
            iconURL: (interaction.member || interaction.user).displayAvatarURL()
         })
         .setFields({
            name: `👛 coin balance`,
            value: `\`${coins.toLocaleString()}\` ${coins === 1 ? `coin` : `coins`}`,
            inline: true
         }, {
            name: `🎒 your items`,
            value: items
               .filter((item, index, self) =>
                  index === self.findIndex(value => item.name === value.name)
               )
               .sort((a, b) => a.name.localeCompare(b.name))
               .map(item => `\`${items.filter(i => i.name === item.name).length.toLocaleString()}\` ${item.emoji} ${item.name}`)
               .join(`\n`)
               || `**\`no items..\`** ${emojis.rip}`,
            inline: true
         })
         .setFooter({
            text: `🪙 you earn 1 coin per message every minute!`
         })
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`currency:menu`)
               .setPlaceholder(`select from the currency menu.. 🪙`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`coin balance and items`)
                     .setValue(`balance`)
                     .setEmoji(`👛`)
                     .setDefault(true),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`the shop`)
                     .setValue(`shop`)
                     .setEmoji(`🏪`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`sell an item`)
                     .setValue(`sell-item`)
                     .setEmoji(`💰`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`give an item to another member`)
                     .setValue(`give-item`)
                     .setEmoji(`📥`)
               )
         )
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds,
      components
   });
};