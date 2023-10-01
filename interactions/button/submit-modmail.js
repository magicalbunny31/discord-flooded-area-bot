export const name = "submit-modmail";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import { FieldValue } from "@google-cloud/firestore";
import { colours, emojis, strip, wait } from "@magicalbunny31/awesome-utility-stuff";

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

   const mfw = `1000871967857053697`;
   await message.react(mfw);


   // edit the interaction's original reply
   await interaction.editReply({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setTitle(`📬 Modmail Submissions`)
            .setDescription(`✅ Thanks for submitting! The ${Discord.roleMention(process.env.FA_ROLE_HEAD_OF_MODERATION)} will read your message and may get back to you soon.`)
      ]
   });
};