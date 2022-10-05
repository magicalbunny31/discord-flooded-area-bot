export const data = new Discord.SlashCommandBuilder()
   .setName(`remove-status`)
   .setDescription(`💬 remove this suggestion's status tag`)
   .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageMessages);

export const guildOnly = true;


import Discord from "discord.js";
import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // this command wasn't run in the suggestion channels
   const rawChannelIds = (await firestore.collection(`channel`).doc(`suggestions`).get()).data();
   const channelIds = Object.values(rawChannelIds);

   if (!interaction.channel.parent || !channelIds.includes(interaction.channel.parent.id) || interaction.channel.parent.id === rawChannelIds[`bug-reports`])
      return await interaction.reply({
         content: `**you can only use this command in posts in the forum channels for suggestions** ${emojis.rip}`,
         ephemeral: true
      });


   // the status tags for this forum channel
   const approvedTag = interaction.channel.parent.availableTags.find(tag => tag.name === `[ APPROVED ]`).id;
   const deniedTag   = interaction.channel.parent.availableTags.find(tag => tag.name === `[ DENIED ]`)  .id;


   // this post doesn't a status tag
   if (!interaction.channel.appliedTags.some(tag => [ approvedTag, deniedTag ].includes(tag)))
      return await interaction.reply({
         content: strip`
            ${emojis.rip} **this post isn't approved nor denied**
            > use </approve:${interaction.client.user.id}> or </deny:${interaction.client.user.id}> (or use the context menu) to change this post's status~
         `, // TODO use builder when available
         ephemeral: true
      });


   // remove this status tag
   const tagIndex = interaction.channel.appliedTags.findIndex(id => id === approvedTag || id === deniedTag);
   interaction.channel.appliedTags.splice(tagIndex, 1);

   await interaction.channel.setAppliedTags([ ...interaction.channel.appliedTags ]);


   // reply to the interaction
   return await interaction.reply({
      content: `removed ${interaction.channel}'s status tag~`,
      ephemeral: true
   });
};