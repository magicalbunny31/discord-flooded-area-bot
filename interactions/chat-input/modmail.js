export const name = "modmail";
export const guilds = [ null ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`modmail`)
   .setDescription(`Submit modmail to Flooded Area Community's Moderation Team`);


import Discord from "discord.js";
import { colours, emojis, choice, strip, wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // this command was run in a guild not from flooded area community
   if (interaction.inGuild() && interaction.guild.id !== process.env.GUILD_FLOODED_AREA)
      return await interaction.reply({
         content: strip`
            ### 📬 ${Discord.chatInputApplicationCommandMention(interaction.commandName, interaction.commandId)} is for submitting modmail in Flooded Area Community
            > - To use it, run this command in my DMs, or in Flooded Area Community.
            >  - https://discord.com/invite/flooded-area-community-977254354589462618
            > - Have an issue in this server? Contact its staff for help!
         `
      });


   // function to return a link to a channel in flooded area community
   const toLink = id => id
      ? `https://discord.com/channels/${process.env.GUILD_FLOODED_AREA}/${id}`
      : `https://discord.com/channels/${process.env.GUILD_FLOODED_AREA}`;


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setTitle(`📬 Modmail Submissions`)
         .setDescription(strip`
            ### ${emojis.bun_paw_wave} ${choice([ `Hello`, `Hi`, `Welcome` ])}, ${interaction.user}!
            > - Anyone can submit \`modmail\` to send a message, or server-related question to the \`Head of Moderation\`.

            ### ✅ You can submit modmail for...
            > - A message to the \`Head of Moderation\`
            > - A server-related query or question
            > - Claiming a prize in ${toLink(process.env.FA_CHANNEL_GIVEAWAYS)}
            > - Reporting a person where we would be able to look into their behaviour/the situation more in depth
            > - Issues with moderation in this server
            > - Help on something about this server

            ### ❌ You cannot submit modmail for...
            > - Reporting a person actively causing harm in chat, ping the \`Moderation Team\`
            > - Reporting players in ${Discord.hyperlink(`Flooded Area`, `https://www.roblox.com/games/3976767347/Flooded-Area`)}, use ${toLink(process.env.FA_CHANNEL_REPORT_A_PLAYER)}
            > - Appealing against moderative actions in ${Discord.hyperlink(`Flooded Area`, `https://www.roblox.com/games/3976767347/Flooded-Area`)}, use ${toLink(process.env.FA_CHANNEL_BAN_APPEALS)}
            > - Reporting bugs in ${Discord.hyperlink(`Flooded Area`, `https://www.roblox.com/games/3976767347/Flooded-Area`)}, use ${toLink(process.env.FA_CHANNEL_BUG_REPORTS)}
            > - Sending silly messages for no reason

            ### 🚨 Ping the \`Moderation Team\` instead if there's an active situation in chat (like a raid or someone being racist)
            > - Do not bring up personal issues in \`modmail\` messages if it's not relevant.
         `)
         .setFooter({
            text: strip`
               "thank you mimi" ~bunny 🐰
               Press the button below to open a form.
            `
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