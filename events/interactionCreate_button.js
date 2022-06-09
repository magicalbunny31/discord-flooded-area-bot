export const name = `interactionCreate`;
export const once = false;


import Discord from "discord.js";
import { colours, noop } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Interaction} interaction
 */
export default async interaction => {
   // this file is for ButtonInteractions
   if (!interaction.isButton())
      return;


   // get the type of button
   const [ type ] = interaction.customId.split(`:`);


   // run what this button does
   switch (type) {


      case `confirm-delete-suggestion`: {
         const [ _type, inChannelId, messageId ] = interaction.customId.split(`:`);

         // "defer" this interaction
         await interaction.update({
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(interaction.user.accentColor || (await interaction.user.fetch(true)).accentColor)
                  .setDescription(`**Deleting suggestion...**`)
            ],
            components: []
         });

         // delete the suggestion message
         const channel = await interaction.guild.channels.fetch(inChannelId);
         const message = await channel.messages.fetch(messageId);

         await message.delete();

         // edit the reply to show that the suggestion was deleted
         await interaction.editReply({
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(interaction.user.accentColor || (await interaction.user.fetch(true)).accentColor)
                  .setDescription(`**Your suggestion in ${channel} has been deleted.**`)
            ]
         });

         return;
      };


      case `create-discussion-thread`: {
         await interaction.update({
            components: []
         });

         return await interaction.message.startThread({
            name: `Suggestion Discussions`
         });
      };


      case `delete-suggestion`: {
         const [ _type, inChannelId, messageId ] = interaction.customId.split(`:`);

         const channel = await interaction.guild.channels.fetch(inChannelId);
         const message = await channel.messages.fetch(messageId);

         // ask for confirmation
         await interaction.update({
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(colours.red)
                  .setDescription(`**Wait - really delete your [suggestion](${message.url}) in ${channel}?**`)
            ],
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents([
                     new Discord.ButtonBuilder()
                        .setCustomId(`confirm-delete-suggestion:${channel.id}:${message.id}`)
                        .setStyle(Discord.ButtonStyle.Danger)
                        .setEmoji(`💥`)
                        .setLabel(`Confirm Delete Suggestion`)
                  ])
            ]
         });

         return;
      };


   };
};