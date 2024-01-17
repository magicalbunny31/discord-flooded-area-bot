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
         .setName(`moderate-queue`)
         .setDescription(`Approve or deny the current QoTD queue, submitted from server members`)
   );


import Discord from "discord.js";