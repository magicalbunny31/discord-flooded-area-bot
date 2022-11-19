export const data = new Discord.SlashCommandBuilder()
   .setName(`deny`)
   .setDescription(`❌ deny this suggestion`)
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
            > use ${Discord.chatInputApplicationCommandMention(`remove-status`, interaction.client.application.id)} (or use the context menu) to remove this post's status~
         `,
         ephemeral: true
      });


   // add the denied tag
   await interaction.channel.setAppliedTags([ ...interaction.channel.appliedTags, deniedTag ]);


   // reply to the interaction
   return await interaction.reply({
      content: `denied ${interaction.channel}~`,
      ephemeral: true
   });
};