export const name = "who-joined-at";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`who-joined-at`)
   .setDescription(`Commands to view who joined this server at what index`)
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`by-member`)
         .setDescription(`View this member's join position in this server`)
         .addUserOption(
            new Discord.SlashCommandUserOption()
               .setName(`member`)
               .setDescription(`The member's position to search for`)
               .setRequired(true)
         )
         .addBooleanOption(
            new Discord.SlashCommandBooleanOption()
               .setName(`check-first-join`)
               .setDescription(`Find this member's original join position?`)
               .setRequired(true)
         )
   )
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`by-position`)
         .setDescription(`View the member who joined this server at this position`)
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`position`)
               .setDescription(`The position's member to search for`)
               .setMinValue(1)
               .setRequired(true)
         )
         .addBooleanOption(
            new Discord.SlashCommandBooleanOption()
               .setName(`check-first-date`)
               .setDescription(`Find this join position's original member?`)
               .setRequired(true)
         )
   );


import Discord from "discord.js";