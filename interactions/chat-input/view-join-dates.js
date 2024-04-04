export const name = "view-join-dates";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`view-join-dates`)
   .setDescription(`View join dates and positions for a member or an index`)
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`at-position`)
         .setDescription(`View the member who joined this server at this position`)
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`position`)
               .setDescription(`Position's member to search for`)
               .setMinValue(1)
               .setRequired(true)
         )
   )
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`for-member`)
         .setDescription(`View a member's join position in this server`)
         .addUserOption(
            new Discord.SlashCommandUserOption()
               .setName(`member`)
               .setDescription(`Member's position to search for`)
               .setRequired(true)
         )
   );


import Discord from "discord.js";