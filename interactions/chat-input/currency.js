export const name = "currency";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`currency`)
   .setDescription(`Access the currency commands`)
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`balance`)
         .setDescription(`View your currency statistics`)
         .addUserOption(
            new Discord.SlashCommandUserOption()
               .setName(`user`)
               .setDescription(`User's currency statistics to view`)
               .setRequired(false)
         )
   )
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`events`)
         .setDescription(`See any events that may affect the economy`)
   )
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`items`)
         .setDescription(`View your items`)
         .addUserOption(
            new Discord.SlashCommandUserOption()
               .setName(`user`)
               .setDescription(`User's items to view`)
               .setRequired(false)
         )
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`menu`)
               .setDescription(`Start the menu at a specific area`)
               .setChoices({
                  name: `Items`,
                  value: `items`
               }, {
                  name: `Personal item`,
                  value: `item`
               }, {
                  name: `Flea market`,
                  value: `flea-market`
               })
               .setRequired(false)
         )
   )
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`shop`)
         .setDescription(`Enter the currency shop to exchange coins for items`)
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`marketplace`)
               .setDescription(`Start the menu at a specific area`)
               .setChoices({
                  name: `🏷️ Items`,
                  value: `shop-items`
               }, {
                  name: `🏬 Special items`,
                  value: `special-items`
               }, {
                  name: `💸 Flea market`,
                  value: `flea-market`
               }, {
                  name: `🥕 Stalk market`,
                  value: `stalk-market`
               })
               .setRequired(false)
         )
   )
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`trade`)
         .setDescription(`Send a trade request to another member`)
         .addUserOption(
            new Discord.SlashCommandUserOption()
               .setName(`user`)
               .setDescription(`The user to send the trade request to`)
               .setRequired(true)
         )
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`item-given`)
               .setDescription(`The item that you'd give to this member`)
               .setAutocomplete(true)
               .setRequired(true)
         )
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`item-given-quantity`)
               .setDescription(`The quantity of the items you'd give to this member`)
               .setMinValue(1)
               .setRequired(false)
         )
         .addStringOption(
            new Discord.SlashCommandStringOption()
               .setName(`item-wanted`)
               .setDescription(`The item that you want to receive in exchange for the item given from this member`)
               .setAutocomplete(true)
               .setRequired(false)
         )
   );


import Discord from "discord.js";