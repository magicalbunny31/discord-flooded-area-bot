export const name = `ready`;
export const once = true;


import Discord from "discord.js";

/**
 * @param {Discord.Client} client
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (client, redis) => {
   // create commands in the Flooded Area Community discord server
   const commandsGuild = `977254354589462618`;
   client.application.commands.set([
      new Discord.SlashCommandBuilder()
         .setName(`set-channel`)
         .setDescription(`📋 Set a channel for a specified submission.`)
         .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageGuild)
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`suggestions`)
               .setDescription(`💬 Set a channel for suggestion submissions to be sent to.`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`type`)
                     .setDescription(`📄 Type of suggestion's channel to change.`)
                     .setChoices({
                        name: `Game Suggestions`,
                        value: `game-suggestions`
                     }, {
                        name: `Server Suggestions`,
                        value: `server-suggestions`
                     }, {
                        name: `Part Suggestions`,
                        value: `part-suggestions`
                     })
                     .setRequired(true)
               )
               .addChannelOption(
                  new Discord.SlashCommandChannelOption()
                     .setName(`channel`)
                     .setDescription(`📋 Channel to change where suggestions are sent to.`)
                     .addChannelTypes(
                        Discord.ChannelType.GuildText
                     )
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`support-tickets`)
               .setDescription(`💬 Set a category for support ticket submissions to be sent to.`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`type`)
                     .setDescription(`📄 Type of support ticket's category to change.`)
                     .setChoices({
                        name: `Map Submissions`,
                        value: `map-tickets`
                     }, {
                        name: `Exploiter/Abuser Reports`,
                        value: `exploiter-tickets`
                     }, {
                        name: `Bug Reports`,
                        value: `bug-tickets`
                     }, {
                        name: `Ban Appeals`,
                        value: `ban-tickets`
                     })
                     .setRequired(true)
               )
               .addChannelOption(
                  new Discord.SlashCommandChannelOption()
                     .setName(`category`)
                     .setDescription(`📋 Category to change where these support tickets are sent to.`)
                     .addChannelTypes(
                        Discord.ChannelType.GuildCategory
                     )
                     .setRequired(true)
               )
         )
         .setDMPermission(false),

      new Discord.SlashCommandBuilder()
         .setName(`flooded-area-statistics`)
         .setDescription(`🌊 View current statistics for Flooded Area on Roblox.`),

      new Discord.SlashCommandBuilder()
         .setName(`america`)
         .setDescription(`america`),

      new Discord.SlashCommandBuilder()
         .setName(`1s-timeout`)
         .setDescription(`⌚ time out someone for 1 second lmao`)
         .addUserOption(
            new Discord.SlashCommandUserOption()
               .setName(`member`)
               .setDescription(`👥 who we timing out lads`)
               .setRequired(true)
         )
         .setDMPermission(false)
   ], commandsGuild);


   // log to console once everything is done
   console.log(`Flooded Area 🌊 is ready~`);
};