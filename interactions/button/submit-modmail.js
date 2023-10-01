export const name = "submit-modmail";
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


   // the report embed (it changes before responding to the interaction)
   const messageEmbed = new Discord.EmbedBuilder(interaction.message.embeds[0].data);


   // update the interaction
   await interaction.update({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setTitle(`📬 Modmail Submissions`)
            .setDescription(`${emojis.loading} This'll take a few seconds: your message is being sent...`)
      ],
      components: []
   });


   // send the modmail
   const messagesChannel = await interaction.guild.channels.fetch(process.env.FA_CHANNEL_MODMAIL_MESSAGES);

   const message = await messagesChannel.send({
      content: Discord.roleMention(process.env.FA_ROLE_HEAD_OF_MODERATION),
      embeds: [
         messageEmbed
      ],
      components: [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setLabel(`Open user profile`)
                  .setStyle(Discord.ButtonStyle.Link)
                  .setURL(`discord://-/users/${interaction.user.id}`)
            )
      ]
   });


   // create a thread for the modmail
   const threadName = (() => {
      const content = Discord.cleanContent(messageEmbed.data.description, interaction.channel);
      const splitPreviewContent = content.replace(/[\n]+/g, ` `).split(` `);
      let previewContent = ``;

      for (const [ i, word ] of splitPreviewContent.entries()) {
         if (previewContent.trim().length + word.length >= 50) {
            // limit the thread name to 50 characters without truncating a word
            previewContent = `${previewContent.trim() || word.slice(0, 50)}...`;
            break;

         } else {
            // add this word the thread name
            previewContent += ` ${word}`;

            // this name can fit the whole of the thread's name
            if (i + 1 === splitPreviewContent.length)
               previewContent = previewContent.trim();
         };
      };

      return previewContent;
   })();

   const thread = await message.startThread({
      name: threadName
   });


   // send a dm to the user of the modmail
   const dm = await (async () => {
      try {
         return await interaction.user.send({
            embeds: [
               messageEmbed
                  .setFooter({
                     text: strip`
                        🌊 Flooded Area Modmail
                        📬 Keep your DMs on to receive and respond to messages.
                     `
                  })
            ],
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.ButtonBuilder()
                        .setCustomId(`add-to-modmail:to-mod:${thread.id}:${interaction.user.id}`)
                        .setLabel(`Reply`)
                        .setStyle(Discord.ButtonStyle.Primary)
                  )
            ]
         });

      } catch {
         // couldn't send the dm
         return null;
      };
   })();


   // send the initial reply button to the thread
   await thread.send({
      components: [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(`add-to-modmail:to-user:${thread.id}:${interaction.user.id}:${dm?.id}`)
                  .setLabel(`Reply`)
                  .setStyle(Discord.ButtonStyle.Primary)
            )
      ]
   });


   // edit the interaction's original reply
   await interaction.editReply({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setTitle(`📬 Modmail Submissions`)
            .setDescription(`✅ Thanks for submitting! The ${Discord.roleMention(process.env.FA_ROLE_HEAD_OF_MODERATION)} will read your message and may get back to you soon. **Turn on your DMs in this server to receive updates and respond to messages.**`)
      ]
   });
};