export const name = `ready`;
export const once = true;


import Discord from "discord.js";
import { choice } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Client} client
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (client, redis) => {
   // create commands in the Flooded Area Community discord server
   const commandsGuild = `977254354589462618`;
   client.application.commands.set([
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
               .setName(`send-reaction-roles-message`)
               .setDescription(`📰 send the initial reaction roles message`)
               .addChannelOption(
                  new Discord.SlashCommandChannelOption()
                     .setName(`channel`)
                     .setDescription(`💬 channel to send the message to`)
                     .addChannelTypes(
                        Discord.ChannelType.GuildText
                     )
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`send-suggestion-message`)
               .setDescription(`📰 send the initial suggestions message`)
               .addChannelOption(
                  new Discord.SlashCommandChannelOption()
                     .setName(`channel`)
                     .setDescription(`💬 channel to send the message to`)
                     .addChannelTypes(
                        Discord.ChannelType.GuildText
                     )
                     .setRequired(true)
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
         .setName(`mod`)
         .setDescription(`🌊 moderator commands for roblox Flooded Area!!`)
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`ban`)
               .setDescription(`🔨 ban a player from roblox Flooded Area`)
               .addIntegerOption(
                  new Discord.SlashCommandIntegerOption()
                     .setName(`player-id`)
                     .setDescription(`👥 their player id (or username) to ban`)
                     .setMinValue(0)
                     .setAutocomplete(true)
                     .setRequired(true)
               )
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`reason`)
                     .setDescription(`📝 why are they being banned? this'll be shown to the banned user too`)
                     .setMaxLength(50)
                     .setRequired(true)
               )
               .addIntegerOption(
                  new Discord.SlashCommandIntegerOption()
                     .setName(`ban-duration`)
                     .setDescription(`⌚ select an option to make this a temporary ban; don't select for a permanent ban [ WIP!!!!! ]`)
                     .setChoices({
                        name: `30 minutes`,
                        value: 1800
                     }, {
                        name: `1 hour`,
                        value: 3600
                     }, {
                        name: `3 hours`,
                        value: 10800
                     }, {
                        name: `6 hours`,
                        value: 21600
                     }, {
                        name: `12 hours`,
                        value: 43200
                     }, {
                        name: `1 day`,
                        value: 86400
                     }, {
                        name: `3 days`,
                        value: 259200
                     }, {
                        name: `1 week`,
                        value: 604800
                     })
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`get-ban-info`)
               .setDescription(`📃 get some pawesome info of a player's roblox Flooded Area ban`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`player-id`)
                     .setDescription(`👥 the player's ban to view.`)
                     .setAutocomplete(true)
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`kick`)
               .setDescription(`🥾 kick a player from roblox Flooded Area`)
               .addIntegerOption(
                  new Discord.SlashCommandIntegerOption()
                     .setName(`player-id`)
                     .setDescription(`👥 their player id (or username) to kick`)
                     .setMinValue(0)
                     .setAutocomplete(true)
                     .setRequired(true)
               )
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`reason`)
                     .setDescription(`📝 why are they being kicked? this'll be shown to the kicked user too`)
                     .setMaxLength(50)
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`revoke-ban`)
               .setDescription(`✅ revoke a player's ban from roblox Flooded Area`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`player-id`)
                     .setDescription(`👥 the player's ban to revoke`)
                     .setAutocomplete(true)
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`show-ban-list`)
               .setDescription(`📋 show the list of banned players from roblox Flooded Area`)
         )
         .setDefaultMemberPermissions(Discord.PermissionFlagsBits.BanMembers),

      new Discord.SlashCommandBuilder()
         .setName(`flooded-area-statistics`)
         .setDescription(`🌊 View current statistics for Flooded Area on Roblox.`),

      new Discord.SlashCommandBuilder()
         .setName(`set`)
         .setDescription(`🏷️ Set a channel or role for command usage.`)
         .addSubcommandGroup(
            new Discord.SlashCommandSubcommandGroupBuilder()
               .setName(`channel`)
               .setDescription(`🏷️ Set a channel for command usage.`)
               .addSubcommand(
                  new Discord.SlashCommandSubcommandBuilder()
                     .setName(`ban-logs`)
                     .setDescription(`💬 Set the ban logs channel.`)
                     .addChannelOption(
                        new Discord.SlashCommandChannelOption()
                           .setName(`channel`)
                           .setDescription(`📋 The ban logs channel.`)
                           .addChannelTypes(
                              Discord.ChannelType.GuildText
                           )
                           .setRequired(true)
                     )
               )
               .addSubcommand(
                  new Discord.SlashCommandSubcommandBuilder()
                     .setName(`suggestions`)
                     .setDescription(`💬 Set a channel for suggestion submissions to be sent to.`)
                     .addStringOption(
                        new Discord.SlashCommandStringOption()
                           .setName(`type`)
                           .setDescription(`📄 Type of suggestion's channel to set.`)
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
                           .setDescription(`📋 Channel to set where suggestions are sent to.`)
                           .addChannelTypes(
                              Discord.ChannelType.GuildText
                           )
                           .setRequired(true)
                     )
               )
         )
         .addSubcommandGroup(
            new Discord.SlashCommandSubcommandGroupBuilder()
               .setName(`role`)
               .setDescription(`🏷️ Set a role for command usage.`)
               .addSubcommand(
                  new Discord.SlashCommandSubcommandBuilder()
                     .setName(`mentions`)
                     .setDescription(`🗯️ Set a mention role for the reaction roles.`)
                     .addStringOption(
                        new Discord.SlashCommandStringOption()
                           .setName(`type`)
                           .setDescription(`📄 Type of mention role to set.`)
                           .setChoices({
                              name: `Looking For Group`,
                              value: `looking-for-group`
                           }, {
                              name: `Events`,
                              value: `events`
                           }, {
                              name: `Polls`,
                              value: `polls`
                           }, {
                              name: `Updates/Sneak Peaks`,
                              value: `updates-sneak-peaks`
                           }, {
                              name: `Giveaways`,
                              value: `giveaways`
                           }, {
                              name: `Challenges`,
                              value: `challenges`
                           }, {
                              name: `Doruk's Exceptional Pings`,
                              value: `doruk's-exceptional-pings`
                           })
                           .setRequired(true)
                     )
                     .addRoleOption(
                        new Discord.SlashCommandRoleOption()
                           .setName(`role`)
                           .setDescription(`📋 Role to set for this mention role.`)
                           .setRequired(true)
                     )
               )
               .addSubcommand(
                  new Discord.SlashCommandSubcommandBuilder()
                     .setName(`moderation-team`)
                     .setDescription(`🗯️ Set the Moderation Team role.`)
                     .addRoleOption(
                        new Discord.SlashCommandRoleOption()
                           .setName(`role`)
                           .setDescription(`📋 The Moderation Team role.`)
                           .setRequired(true)
                     )
               )
               .addSubcommand(
                  new Discord.SlashCommandSubcommandBuilder()
                     .setName(`pronouns`)
                     .setDescription(`🗯️ Set a pronoun role for the reaction roles.`)
                     .addStringOption(
                        new Discord.SlashCommandStringOption()
                           .setName(`type`)
                           .setDescription(`📄 Type of pronoun role to set.`)
                           .setChoices({
                              name: `He/Him`,
                              value: `he-him`
                           }, {
                              name: `She/Her`,
                              value: `she-her`
                           }, {
                              name: `They/Them`,
                              value: `they-them`
                           }, {
                              name: `Ask For Pronouns`,
                              value: `ask-for-pronouns`
                           }, {
                              name: `Other Pronouns`,
                              value: `other-pronouns`
                           })
                           .setRequired(true)
                     )
                     .addRoleOption(
                        new Discord.SlashCommandRoleOption()
                           .setName(`role`)
                           .setDescription(`📋 Role to set for this pronoun role.`)
                           .setRequired(true)
                     )
               )
               .addSubcommand(
                  new Discord.SlashCommandSubcommandBuilder()
                     .setName(`suggestions-banned`)
                     .setDescription(`🗯️ Set the Suggestions Banned role.`)
                     .addRoleOption(
                        new Discord.SlashCommandRoleOption()
                           .setName(`role`)
                           .setDescription(`📋 The Suggestions Banned role.`)
                           .setRequired(true)
                     )
               )
         )
         .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageGuild)
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
         )
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`content`)
               .setDescription(`📋 Fuzzy search for suggestions that may match this content.`)
         )
         .addIntegerOption( // TODO datepicker
            new Discord.SlashCommandIntegerOption()
               .setName(`created-before-date`)
               .setDescription(`📅 [ OPTION NOT IN USE: VALUE WILL BE IGNORED ]`)
               .setMinValue(0)
         )
         .addIntegerOption( // TODO datepicker
            new Discord.SlashCommandIntegerOption()
               .setName(`created-after-date`)
               .setDescription(`📅 [ OPTION NOT IN USE: VALUE WILL BE IGNORED ]`)
               .setMinValue(0)
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
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`minimum-overall-vote`)
               .setDescription(`⬇️ View suggestions with an overall vote (upvotes - downvotes) greater than or equal to this value.`)
               .setMinValue(-4999)
               .setMaxValue(4999)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`maximum-overall-vote`)
               .setDescription(`⬆️ View suggestions with an overall vote (upvotes - downvotes) less than or equal to this value.`)
               .setMinValue(-4999)
               .setMaxValue(4999)
         )
   ], commandsGuild);


   // statuses
   setInterval(() => {
      //? list of statuses
      const activities = {
         [Discord.ActivityType.Playing]: [
            `Flooded Area 🌊`,
            `with the waves 🌊`
         ],
         [Discord.ActivityType.Watching]: [
            `the waves 🌊`,
            `your suggestions 📋`
         ],
         [Discord.ActivityType.Listening]: [
            `the waves 🌊`,
            `your suggestions 📋`
         ],
         [Discord.ActivityType.Competing]: [
            `the best boat ⛵`,
            `a challenge 🎯`
         ]
      };

      const activityType = +choice(Object.keys(activities));
      const activityName = choice(activities[activityType]);

      client.user.setPresence({
         status: `online`,
         activities: [{
            type: activityType,
            name: activityName
         }]
      });
   }, 1.8e+6); //? 30 minutes


   // log to console once everything is done
   console.log(`Flooded Area 🌊 is ready~`);
};