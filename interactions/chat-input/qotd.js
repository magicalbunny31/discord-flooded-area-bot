export const name = "qotd";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`qotd`)
   .setDescription(`Manage QoTDs`)
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`create`)
         .setDescription(`Create a QoTD`)
   );


import Discord from "discord.js";