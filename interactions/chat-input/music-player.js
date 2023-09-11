export const name = "music-player";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT, process.env.GUILD_BUNNY_FURFEST ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`music-player`)
   .setDescription(`Commands to play music found in-game`)
   .addSubcommandGroup(
      new Discord.SlashCommandSubcommandGroupBuilder()
         .setName(`play`)
         .setDescription(`Play music found in-game`)
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`category`)
               .setDescription(`Play a random track from a specified category`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`name`)
                     .setDescription(`Category to select a random track from`)
                     .setAutocomplete(true)
                     .setRequired(true)
               )
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`behaviour`)
                     .setDescription(`What should happen when the track finishes playing`)
                     .setChoices({
                        name: `Play another track from this category`,
                        value: `loop-category`
                     }, {
                        name: `Repeat the last played track`,
                        value: `loop-track`
                     }, {
                        name: `Stop the music player and leave the voice channel`,
                        value: `disconnect`
                     })
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`random`)
               .setDescription(`Play a random track`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`behaviour`)
                     .setDescription(`What should happen when the track finishes playing`)
                     .setChoices({
                        name: `Play another random track`,
                        value: `loop-random`
                     }, {
                        name: `Repeat the last played track`,
                        value: `loop-track`
                     }, {
                        name: `Stop the music player and leave the voice channel`,
                        value: `disconnect`
                     })
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`track`)
               .setDescription(`Play a specific track`)
               .addIntegerOption(
                  new Discord.SlashCommandIntegerOption()
                     .setName(`name`)
                     .setDescription(`Track to play`)
                     .setAutocomplete(true)
                     .setRequired(true)
               )
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`behaviour`)
                     .setDescription(`What should happen when the track finishes playing`)
                     .setChoices({
                        name: `Repeat the track`,
                        value: `loop-track`
                     }, {
                        name: `Stop the music player and leave the voice channel`,
                        value: `disconnect`
                     })
                     .setRequired(true)
               )
         )
   )
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`stop`)
         .setDescription(`Stop playing music in this server`)
   )
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`view-tracks`)
         .setDescription(`View the list of music that plays in-game`)
   );


import Discord from "discord.js";