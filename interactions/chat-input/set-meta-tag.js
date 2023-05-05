export const data = new Discord.SlashCommandBuilder()
   .setName(`set-meta-tag`)
   .setDescription(`🏷️ Set this suggestion's meta tag.`)
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`tag`)
         .setDescription(`📰 The forum tag to set as this post's meta tag.`)
         .setChoices({
            name: `⭐ Staff Picks`,
            value: `Staff Picks`
         }, {
            name: `⚠️ Being Developed...`,
            value: `Being Developed...`
         }, {
            name: `✅ Approved For Update`,
            value: `Approved For Update`
         }, {
            name: `🎮 Added In-Game`,
            value: `Added In-Game`
         }, {
            name: `❌ Denied`,
            value: `Denied`
         })
         .setRequired(true)
   )
   .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageMessages);

export const guildOnly = true;


import Discord from "discord.js";
import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const tag = interaction.options.getString(`tag`);


   // this command wasn't run in the suggestion channels (also exclude server suggestions)
   if (![ process.env.CHANNEL_GAME_SUGGESTIONS, process.env.CHANNEL_PART_SUGGESTIONS ].includes(interaction.channel.parent?.id))
      return await interaction.reply({
         content: `❌ **You can only use this command in posts in ${Discord.channelMention(process.env.CHANNEL_GAME_SUGGESTIONS)} or ${Discord.channelMention(process.env.CHANNEL_PART_SUGGESTIONS)}.**`,
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // get this post's tags (formatted by their names)
   const channelTags = interaction.channel.parent.availableTags;
   const postTags    = interaction.channel.appliedTags.map(tagId => channelTags.find(channelTag => channelTag.id === tagId).name);


   // meta tags, only one can be set at a time
   const metaTags = [
      `Staff Picks`,
      `Being Developed...`,
      `Approved For Update`,
      `Added In-Game`,
      `Denied`
   ];


   // remove any current meta tags, if there is one
   for (const metaTag of metaTags)
      if (postTags.includes(metaTag))
         postTags.splice(postTags.findIndex(postTag => postTag === metaTag), 1);


   // add the new meta tag
   postTags.push(tag);


   // set this post's new meta tags
   const tagsToApply = postTags.map(tag => channelTags.find(channelTag => channelTag.name === tag).id);

   await interaction.channel.setAppliedTags(tagsToApply);


   // edit the deferred interaction
   return await interaction.editReply({
      content: `Updated ${interaction.channel}'s meta tags!`
   });
};