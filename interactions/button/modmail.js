export const name = "modmail";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import { colours, emojis, choice, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button ] = interaction.customId.split(`:`);


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setTitle(`📬 Modmail Submissions`)
         .setDescription(strip`
            ### ${emojis.bun_paw_wave} ${choice([ `Hello`, `Hi`, `Welcome` ])}, ${interaction.user}!
            > - Any member can submit ${interaction.channel} to send a message, or server-related question to the ${Discord.roleMention(process.env.FA_ROLE_HEAD_OF_MODERATION)}.

            ### ✅ You can submit modmail for...
            > - A message to the ${Discord.roleMention(process.env.FA_ROLE_HEAD_OF_MODERATION)}
            > - A server-related query or question
            > - Claiming a ${Discord.channelMention(process.env.FA_CHANNEL_GIVEAWAYS)}
            > - Concerns about another person here
            > - Issues with moderation in this server
            > - Help on something about this server

            ### ❌ You cannot submit modmail for:
            > - Reporting players in ${Discord.hyperlink(`Flooded Area`, `https://www.roblox.com/games/3976767347/Flooded-Area`)} use ${Discord.channelMention(process.env.FA_CHANNEL_REPORT_A_PLAYER)}
            > - Appealing against moderative actions in ${Discord.hyperlink(`Flooded Area`, `https://www.roblox.com/games/3976767347/Flooded-Area`)}, use ${Discord.channelMention(process.env.FA_CHANNEL_BAN_APPEALS)}
            > - Reporting bugs in ${Discord.hyperlink(`Flooded Area`, `https://www.roblox.com/games/3976767347/Flooded-Area`)}, use ${Discord.channelMention(process.env.FA_CHANNEL_BUG_REPORTS)}
            > - Exposing a person here
            > - Reporting a member in this server for breaking the ${Discord.channelMention(process.env.FA_CHANNEL_RULES_AND_INFO)}, notify a member of the ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} instead
            > - Sending silly messages for no reason
         `)
         .setFooter({
            text: `Press the button below to open a form.`
         })
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`create-modmail`)
               .setLabel(`Create modmail`)
               .setEmoji(`🗒️`)
               .setStyle(Discord.ButtonStyle.Success)
         )
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds,
      components
   });
};