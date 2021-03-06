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
         .setDescription(`πΊπΈ america`),

      new Discord.SlashCommandBuilder()
         .setName(`bun-stuff`)
         .setDescription(`π€ bunny's dev commands`)
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`demo`)
               .setDescription(`π€ demo of something and something blah blah, i don't know`)
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`send-suggestion-message`)
               .setDescription(`π° send the initial suggestions message`)
               .addChannelOption(
                  new Discord.SlashCommandChannelOption()
                     .setName(`channel`)
                     .setDescription(`π¬ channel to send the message in`)
                     .addChannelTypes(
                        Discord.ChannelType.GuildText
                     )
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`update-suggestion-messages`)
               .setDescription(`π° update messages in the suggestion channels`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`type`)
                     .setDescription(`π what suggestion channel's suggestion messages to change`)
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
         .setName(`flooded-area`)
         .setDescription(`π Commands for Flooded Area on Roblox.`)
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`ban`)
               .setDescription(`π¨ Permanently ban a player from Flooded Area on Roblox.`)
               .addIntegerOption(
                  new Discord.SlashCommandIntegerOption()
                     .setName(`player-id`)
                     .setDescription(`π₯ Roblox Player's id to ban.`)
                     .setMinValue(0)
                     .setAutocomplete(true)
                     .setRequired(true)
               )
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`reason`)
                     .setDescription(`π Reason to display to the player why they're banned.`)
                     .setMaxLength(50)
                     .setRequired(true)
               )
               .addIntegerOption( // TODO datepicker
                  new Discord.SlashCommandIntegerOption()
                     .setName(`ban-until`)
                     .setDescription(`π [ OPTION NOT IN USE: VALUE WILL BE IGNORED ]`)
                     .setMinValue(0)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`get-ban-info`)
               .setDescription(`π Get info of a player's ban from Flooded Area on Roblox.`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`player-id`)
                     .setDescription(`π₯ Roblox Player's id's ban to view.`)
                     .setAutocomplete(true)
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`revoke-ban`)
               .setDescription(`β Revoke a player's ban from Flooded Area on Roblox.`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`player-id`)
                     .setDescription(`π₯ Roblox Player's id's ban to revoke.`)
                     .setAutocomplete(true)
                     .setRequired(true)
               )
         )
         .setDefaultMemberPermissions(Discord.PermissionFlagsBits.BanMembers),

      new Discord.SlashCommandBuilder()
         .setName(`flooded-area-statistics`)
         .setDescription(`π View current statistics for Flooded Area on Roblox.`),

      new Discord.SlashCommandBuilder()
         .setName(`set-channel`)
         .setDescription(`π Set a channel for a specified submission.`)
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`ban-logs`)
               .setDescription(`π¬ Set a channel for ban logs to be sent to.`)
               .addChannelOption(
                  new Discord.SlashCommandChannelOption()
                     .setName(`channel`)
                     .setDescription(`π Channel to set where ban logs are sent to.`)
                     .addChannelTypes(
                        Discord.ChannelType.GuildText
                     )
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`suggestions`)
               .setDescription(`π¬ Set a channel for suggestion submissions to be sent to.`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`type`)
                     .setDescription(`π Type of suggestion's channel to change.`)
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
                     .setDescription(`π Channel to set where suggestions are sent to.`)
                     .addChannelTypes(
                        Discord.ChannelType.GuildText
                     )
                     .setRequired(true)
               )
         )
         .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageGuild)
         .setDMPermission(false),

      new Discord.SlashCommandBuilder()
         .setName(`view-suggestions`)
         .setDescription(`π° Bulk-view suggestions.`)
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`suggestion-channel`)
               .setDescription(`π¬ What suggestion channel's suggestions to view.`)
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
               .setDescription(`π€ View suggestions from this user (or user's id).`)
         )
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`content`)
               .setDescription(`π Fuzzy search for suggestions that may match this content.`)
         )
         .addIntegerOption( // TODO datepicker
            new Discord.SlashCommandIntegerOption()
               .setName(`created-before-date`)
               .setDescription(`π [ OPTION NOT IN USE: VALUE WILL BE IGNORED ]`)
               .setMinValue(0)
         )
         .addIntegerOption( // TODO datepicker
            new Discord.SlashCommandIntegerOption()
               .setName(`created-after-date`)
               .setDescription(`π [ OPTION NOT IN USE: VALUE WILL BE IGNORED ]`)
               .setMinValue(0)
         )
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`status`)
               .setDescription(`π« Status of the suggestions to view.`)
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
               .setDescription(`π View locked suggestions?`)
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
               .setDescription(`ποΈ View deleted suggestions?`)
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
               .setDescription(`β¬οΈ View suggestions with an overall vote (upvotes - downvotes) greater than or equal to this value.`)
               .setMinValue(-4999)
               .setMaxValue(4999)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`maximum-overall-vote`)
               .setDescription(`β¬οΈ View suggestions with an overall vote (upvotes - downvotes) less than or equal to this value.`)
               .setMinValue(-4999)
               .setMaxValue(4999)
         )
   ], commandsGuild);


   // statuses
   setInterval(() => {
      //? random fox variables
      const fox = choice([ `fox`, `foxie`, `foxxo` ]);
      const foxes = `${fox}${/x$/.test(fox) ? `es` : `s`}`;

      //? list of statuses
      const activities = {
         [Discord.ActivityType.Playing]: [
            `Flooded Area π`,
            `with the waves π`
         ],
         [Discord.ActivityType.Watching]: [
            `the waves π`,
            `your suggestions π`
         ],
         [Discord.ActivityType.Listening]: [
            `the waves π`,
            `your suggestions π`
         ],
         [Discord.ActivityType.Competing]: [
            `the best boat β΅`,
            `a challenge π―`
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
   console.log(`Flooded Area π is ready~`);
};