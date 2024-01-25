export const name = "qotd";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`qotd`)
   .setDescription(`Manage QoTDs`)
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`create`)
         .setDescription(`Create a QoTD`)
   )
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`submissions`)
         .setDescription(`View the statuses of your QoTD submissions`)
   )
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`queue`)
         .setDescription(`View the current QoTD queue`)
   );


import Discord from "discord.js";