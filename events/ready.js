export const name = Discord.Events.ClientReady;
export const once = true;


import Discord from "discord.js";

/**
 * will run once, when the bot has logged into discord and is ready
 * @param {Discord.Client} client
 */
export default async client => {
   // chat-input application commands
   const data = [
      new Discord.SlashCommandBuilder()
         .setName(`ban`)
         .setDescription(`permanently ban a player from flooded area`)
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player`)
               .setDescription(`player to ban`)
               .setMinValue(1)
               .setAutocomplete(true)
               .setRequired(true)
         )
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`reason`)
               .setDescription(`reason to show in ⁠the moderation logs, this isn't shown to the banned player`)
               .setMaxLength(1024)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player2`)
               .setDescription(`player to ban`)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player3`)
               .setDescription(`player to ban`)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player4`)
               .setDescription(`player to ban`)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player5`)
               .setDescription(`player to ban`)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player6`)
               .setDescription(`player to ban`)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player7`)
               .setDescription(`player to ban`)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player8`)
               .setDescription(`player to ban`)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player9`)
               .setDescription(`player to ban`)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player10`)
               .setDescription(`player to ban`)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`reban`)
               .setDescription(`should the player be unbanned first? (this will be ignored when multiple players are inputted)`)
               .setChoices({
                  name: `✅ yes, reban`,
                  value: `true`
               }, {
                  name: `❌ no, don't reban (default)`,
                  value: `false`
               })
               .setRequired(false)
         )
         .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageGuild)
         .setDMPermission(false),

      new Discord.SlashCommandBuilder()
         .setName(`help`)
         .setDescription(`help on how to use the bot`)
         .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageGuild)
         .setDMPermission(false),

      new Discord.SlashCommandBuilder()
         .setName(`kick`)
         .setDescription(`kick a player from a server in flooded area, if they are already in a server`)
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player`)
               .setDescription(`player to kick`)
               .setMinValue(1)
               .setAutocomplete(true)
               .setRequired(true)
         )
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`reason`)
               .setDescription(`reason to show in ⁠the moderation logs, this isn't shown to the kicked player`)
               .setMaxLength(1024)
               .setRequired(false)
         )
         .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageGuild)
         .setDMPermission(false),

      new Discord.SlashCommandBuilder()
         .setName(`tempban`)
         .setDescription(`temporarily ban a player from flooded area`)
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player`)
               .setDescription(`player to temporarily ban`)
               .setMinValue(1)
               .setAutocomplete(true)
               .setRequired(true)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`duration`)
               .setDescription(`duration for the ban, it can be in seconds (86400) or in number/durations (3d2h1m)`)
               .setMinValue(1)
               .setAutocomplete(true)
               .setRequired(true)
         )
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`reason`)
               .setDescription(`reason to show in ⁠the moderation logs, this isn't shown to the banned player`)
               .setMaxLength(1024)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player2`)
               .setDescription(`player to temporarily ban`)
               .setMinValue(1)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player3`)
               .setDescription(`player to temporarily ban`)
               .setMinValue(1)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player4`)
               .setDescription(`player to temporarily ban`)
               .setMinValue(1)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player5`)
               .setDescription(`player to temporarily ban`)
               .setMinValue(1)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player6`)
               .setDescription(`player to temporarily ban`)
               .setMinValue(1)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player7`)
               .setDescription(`player to temporarily ban`)
               .setMinValue(1)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player8`)
               .setDescription(`player to temporarily ban`)
               .setMinValue(1)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player9`)
               .setDescription(`player to temporarily ban`)
               .setMinValue(1)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player10`)
               .setDescription(`player to temporarily ban`)
               .setMinValue(1)
               .setAutocomplete(true)
               .setRequired(false)
         )
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`retempban`)
               .setDescription(`should the player be unbanned first? (this will be ignored when multiple players are inputted)`)
               .setChoices({
                  name: `✅ yes, reban`,
                  value: `true`
               }, {
                  name: `❌ no, don't reban (default)`,
                  value: `false`
               })
               .setRequired(false)
         )
         .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageGuild)
         .setDMPermission(false),

      new Discord.SlashCommandBuilder()
         .setName(`unban`)
         .setDescription(`revoke a player's ban from flooded area`)
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`player`)
               .setDescription(`player's ban to revoke`)
               .setMinValue(1)
               .setAutocomplete(true)
               .setRequired(true)
         )
         .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageGuild)
         .setDMPermission(false)
   ];


   // register application commands
   await client.application.commands.set(data);


   // bot is ready
   console.log(`🤖 discord bot ready~`);
};