export const data = new Discord.SlashCommandBuilder()
   .setName(`approve`)
   .setDescription(`✅ approve this suggestion`)
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
         content: `you can only use this command in posts in the forum channels for suggestions ${emojis.rip}`,
         ephemeral: true
      });


   // the status tags for this forum channel
   const approvedTag = interaction.channel.parent.availableTags.find(tag => tag.name === `[ APPROVED ]`).id;
   const deniedTag   = interaction.channel.parent.availableTags.find(tag => tag.name === `[ DENIED ]`)  .id;


   // this post already has a status tag
   if (interaction.channel.appliedTags.some(tag => [ approvedTag, deniedTag ].includes(tag)))
      return await interaction.reply({
         content: strip`
            ${emojis.rip} **this post is already ${interaction.channel.appliedTags.includes(approvedTag) ? `approved` : `denied`}**
            > use </remove-status:${interaction.client.user.id}> (or use the context menu) to remove this post's status~
         `, // TODO use builder when available
         ephemeral: true
      });


   // add the approved tag
   await interaction.channel.setAppliedTags([ ...interaction.channel.appliedTags, approvedTag ]);


   // reply to the interaction
   return await interaction.reply({
      content: `approved ${interaction.channel}~`,
      ephemeral: true
   });
};