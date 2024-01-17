export const name = "qotd moderate-queue";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];


import Discord from "discord.js";
import { colours, choice } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // this person isn't a part of the @Moderation Team
   if (!interaction.member.roles.cache.has(process.env.FA_ROLE_MODERATION_TEAM))
      return await interaction.reply({
         content: `### ❌ Only the ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} can moderate the queue`,
         ephemeral: true
      });


   // fetch unapproved submissions
   const qotdColRef  = firestore.collection(`qotd`);
   const qotdColSnap = await qotdColRef.get();

   const qotdColDocs = qotdColSnap.docs
      .filter(qotdDocSnap => qotdDocSnap.exists && !qotdDocSnap.data().approved);


   // no unapproved submissions
   if (!qotdColDocs.length)
      return await interaction.reply({
         content: `### 📂 There are currently no ${Discord.channelMention(process.env.FA_CHANNEL_QOTD)} submissions`,
         ephemeral: true
      });


   // get the first doc
   const [ qotdDocSnap ] = qotdColDocs;
   const qotdDocData = qotdDocSnap.data();


   // embeds
   const user = await interaction.client.users.fetch(qotdDocData.user, { force: true });
   const embedColour = user.accentColor || choice([ colours.red, colours.orange, colours.yellow, colours.green, colours.blue, colours.purple, colours.pink ]);

   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(embedColour)
         .setAuthor({
            name: `@${user.username} (${user.id})`,
            iconURL: user.displayAvatarURL()
         }),

      ...qotdDocData.threadName
         ? [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setFields({
                  name: `Thread name`,
                  value: Discord.escapeMarkdown(qotdDocData.threadName)
               })
         ]
         : []
   ];

   if (qotdDocData.description)
      embeds[0].setDescription(qotdDocData.description);

   if (qotdDocData.imageUrl)
      embeds[0].setImage(qotdDocData.imageUrl);

   if (qotdDocData.reactionChoices?.length)
      embeds[0].setFields({
         name: `\u200b`,
         value: qotdDocData.reactionChoices
            .map(reactionChoice => `> ${reactionChoice.reactionEmoji} ${reactionChoice.reactionName}`)
            .join(`\n`)
      });


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`qotd-moderate-queue:approve:${qotdDocSnap.id}`)
               .setLabel(`Approve`)
               .setEmoji(`✅`)
               .setStyle(Discord.ButtonStyle.Success),
            new Discord.ButtonBuilder()
               .setCustomId(`qotd-moderate-queue:deny:${qotdDocSnap.id}`)
               .setLabel(`Deny`)
               .setEmoji(`❌`)
               .setStyle(Discord.ButtonStyle.Danger)
         )
   ];


   // reply to the interaction
   await interaction.reply({
      embeds,
      components,
      ephemeral: true
   });
};