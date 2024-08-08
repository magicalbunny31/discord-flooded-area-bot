export const name = "qotd-create";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];


import Discord from "discord.js";
import dayjs from "dayjs";
import { Timestamp } from "@google-cloud/firestore";
import { colours, emojis, choice, strip } from "@magicalbunny31/awesome-utility-stuff";

import cache from "../../data/cache.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, id ] = interaction.customId.split(`:`);


   // cache
   const data = cache.get(`qotd:${id}`);


   // application commands
   const commands = await interaction.guild.commands.fetch();

   const commandQotdId = commands.find(command => command.name === `qotd`)?.id || 0;


   // embeds
   const embeds = [
      ...interaction.message.embeds,

      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setDescription(strip`
            ### 📥 Your QoTD has been submitted
            > - The ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} will review your QoTD before it gets posted to ${Discord.channelMention(process.env.FA_CHANNEL_QOTD)}.
            >  - Use ${emojis.slash_command} ${Discord.chatInputApplicationCommandMention(`qotd`, `submissions`, commandQotdId)} to view the statuses of your submissions.
            >  - Use ${emojis.slash_command} ${Discord.chatInputApplicationCommandMention(`qotd`, `queue`, commandQotdId)} to view the whole QoTD queue.
            > - New ${Discord.channelMention(process.env.FA_CHANNEL_QOTD)}s are posted every day at ${Discord.time(dayjs().startOf(`day`).add(12, `hours`).toDate(), Discord.TimestampStyles.ShortTime)}.
         `)
   ];


   // update the interaction's original reply
   await interaction.update({
      embeds,
      components: []
   });


   // embeds
   const embedColour = interaction.user.accentColor || choice([ colours.red, colours.orange, colours.yellow, colours.green, colours.blue, colours.purple, colours.pink ]);

   embeds.splice(0, 5,
      new Discord.EmbedBuilder()
         .setColor(embedColour)
         .setAuthor({
            name: `@${interaction.user.username} (${interaction.user.id})`,
            iconURL: interaction.user.displayAvatarURL()
         }),

      ...data.threadName
         ? [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setFields({
                  name: `Thread name`,
                  value: Discord.escapeMarkdown(data.threadName)
               })
         ]
         : []
   );

   if (data.description)
      embeds[0].setDescription(data.description);

   if (data.imageUrl)
      embeds[0].setImage(data.imageUrl);

   if (data.reactionChoices?.length)
      embeds[0].setFields({
         name: `\u200b`,
         value: data.reactionChoices
            .map(reactionChoice => `> ${reactionChoice.reactionEmoji} ${reactionChoice.reactionName}`)
            .join(`\n`)
      });


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`qotd-moderate-queue:approve:${id}`)
               .setLabel(`Approve`)
               .setEmoji(`✅`)
               .setStyle(Discord.ButtonStyle.Success),
            new Discord.ButtonBuilder()
               .setCustomId(`qotd-moderate-queue:deny:${id}`)
               .setLabel(`Deny`)
               .setEmoji(`❌`)
               .setStyle(Discord.ButtonStyle.Danger)
         )
   ];


   // send to the qotd submissions channel
   const channel = await interaction.guild.channels.fetch(process.env.FA_ROLE_QOTD_SUBMISSIONS);

   const message = await channel.send({
      embeds,
      components
   });


   // set this data in the database
   const qotdDocRef = firestore.collection(`qotd`).doc(interaction.guildId).collection(`submissions`).doc(id);

   await qotdDocRef.set({
      ...data,
      approved: false,
      message:  message.id,
      user:     interaction.user.id
   });
};