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
         .setName(`1s-timeout`)
         .setDescription(`⌚ time out someone for 1 second lmao`)
         .addUserOption(
            new Discord.SlashCommandUserOption()
               .setName(`member`)
               .setDescription(`👥 who we timing out lads`)
               .setRequired(true)
         )
         .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ModerateMembers)
         .setDMPermission(false),

      new Discord.SlashCommandBuilder()
         .setName(`america`)
         .setDescription(`🇺🇸 america`),

      new Discord.SlashCommandBuilder()
         .setName(`bun-stuff`)
         .setDescription(`🤖 bunny's dev commands`)
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`demo`)
               .setDescription(`🤖 demo of something and something blah blah, i don't know`)
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`send-suggestion-message`)
               .setDescription(`📰 send the initial suggestions message`)
               .addChannelOption(
                  new Discord.SlashCommandChannelOption()
                     .setName(`channel`)
                     .setDescription(`💬 channel to send the message in`)
                     .addChannelTypes(
                        Discord.ChannelType.GuildText
                     )
                     .setRequired(false)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`update-suggestion-messages`)
               .setDescription(`📰 update messages in the suggestion channels`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`type`)
                     .setDescription(`📄 what suggestion channel's suggestion messages to change`)
                     .setChoices({
                        name: `game-suggestions`,
                        value: `game-suggestions`
                     }, {
                        name: `server-suggestions`,
                        value: `server-suggestions`
                     }, {
                        name: `part-suggestions`,
                        value: `part-suggestions`
                     })
                     .setRequired(true)
               )
         )
         .setDefaultMemberPermissions(Discord.PermissionFlagsBits.Administrator)
         .setDMPermission(false),

      new Discord.SlashCommandBuilder()
         .setName(`flooded-area-statistics`)
         .setDescription(`🌊 View current statistics for Flooded Area on Roblox.`),

      new Discord.SlashCommandBuilder()
         .setName(`global-ban`)
         .setDescription(`🔨 just a test rn, waiting for enrise uwu owo`)
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player-id`)
               .setDescription(`👥 Roblox Player's id to ban.`)
               .setMinValue(0)
               .setAutocomplete(true)
               .setRequired(true)
         )
         .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ModerateMembers),

      new Discord.SlashCommandBuilder()
         .setName(`meow`)
         .setDescription(`😺 nya~`),

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
         .setName(`view-suggestions`)
         .setDescription(`📰 Bulk-view suggestions.`)
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`suggestion-channel`)
               .setDescription(`💬 What suggestion channel's suggestions to view.`)
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
         .addUserOption(
            new Discord.SlashCommandUserOption()
               .setName(`suggester`)
               .setDescription(`👤 View suggestions from this user (or user's id).`)
               .setRequired(false)
         )
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`content`)
               .setDescription(`📋 Fuzzy search for suggestions that may match this content.`)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`created-before-date`)
               .setDescription(`📅 [ OPTION NOT IN USE: VALUE WILL BE IGNORED ]`)
               .setMinValue(0)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`created-after-date`)
               .setDescription(`📅 [ OPTION NOT IN USE: VALUE WILL BE IGNORED ]`)
               .setMinValue(0)
               .setRequired(false)
         )
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`status`)
               .setDescription(`🎫 Status of the suggestions to view.`)
               .setChoices({
                  name: `Open for discussion`,
                  value: `open for discussion`
               }, {
                  name: `Approved`,
                  value: `approved`
               }, {
                  name: `Denied`,
                  value: `denied`
               })
               .setRequired(false)
         )
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`is-locked`)
               .setDescription(`🔒 View locked suggestions?`)
               .setChoices({
                  name: `View only locked suggestions`,
                  value: `true`
               }, {
                  name: `View only unlocked suggestions`,
                  value: `false`
               }, {
                  name: `View both locked and unlocked suggestions`,
                  value: `both`
               })
               .setRequired(false)
         )
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`is-deleted`)
               .setDescription(`🗑️ View deleted suggestions?`)
               .setChoices({
                  name: `View only deleted suggestions`,
                  value: `true`
               }, {
                  name: `View only not deleted suggestions`,
                  value: `false`
               }, {
                  name: `View both deleted and not deleted suggestions`,
                  value: `both`
               })
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`minimum-overall-vote`)
               .setDescription(`⬇️ View suggestions with an overall vote (upvotes - downvotes) greater than or equal to this value.`)
               .setMinValue(-4999)
               .setMaxValue(4999)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`maximum-overall-vote`)
               .setDescription(`⬆️ View suggestions with an overall vote (upvotes - downvotes) less than or equal to this value.`)
               .setMinValue(-4999)
               .setMaxValue(4999)
               .setRequired(false)
         )
   ], commandsGuild);


   // log to console once everything is done
   console.log(`Flooded Area 🌊 is ready~`);
};