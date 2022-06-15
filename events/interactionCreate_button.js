export const name = `interactionCreate`;
export const once = false;


import Discord from "discord.js";
import { colours, choice, noop } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Interaction} interaction
 */
export default async interaction => {
   // this file is for ButtonInteractions
   if (!interaction.isButton())
      return;


   // this user is banned from making suggestions
   const suggestionsBannedRoleId = `979489114153963560`;
   const reactionMemberIsSuggestionsBanned = interaction.member.roles.cache.has(suggestionsBannedRoleId);

   if (reactionMemberIsSuggestionsBanned)
      return await interaction.reply({
         content: `You are banned from making suggestions.`,
         ephemeral: true
      });


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
         return await interaction.editReply({
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(interaction.user.accentColor || (await interaction.user.fetch(true)).accentColor)
                  .setDescription(`**Your suggestion in ${channel} has been deleted.**`)
            ]
         });
      };


      case `create-discussion-thread`: {
         // update the interaction to remove the button from the suggestion's message
         await interaction.update({
            components: []
         });

         // create a thread on the suggestion's message
         const thread = await interaction.message.startThread({
            name: `Suggestion Discussions`
         });

         try {
            // add the suggestion author to the thread
            const authorId = interaction.message.embeds[0].data.author.name.match(/\([^()]*\)/g)?.pop().slice(1, -1);
            await thread.members.add(authorId);

         } catch {
            // an error occurred: the suggestion author probably left the server
            noop;
         };

         // send who started the thread
         await thread.send({
            content: `**Thread started by ${interaction.user}**, ${choice([
               `say hi!`,                               `I wonder what they've got to say.`,
               `incoming discussion!`,                  `conversation inbound!`,
               `looks like they want to discuss this.`, `welcome to the beginning of this awesome channel.`
            ])}`
         });

         // delete the system message in the channel saying that a thread was created
         const messages = await interaction.channel.messages.fetch({
            after: interaction.id
         });
         const message = messages.find(message => message.author.id === interaction.client.user.id && message.system);

         if (!message || !message.deletable)
            return;
         else
            return await message.delete();
      };


      case `delete-suggestion`: {
         const [ _type, inChannelId, messageId ] = interaction.customId.split(`:`);

         const channel = await interaction.guild.channels.fetch(inChannelId);
         const message = await channel.messages.fetch(messageId);

         // ask for confirmation
         return await interaction.update({
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
      };


   };
};