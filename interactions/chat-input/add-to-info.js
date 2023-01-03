export const data = new Discord.SlashCommandBuilder()
   .setName(`add-to-info`)
   .setDescription(`➕ add/overwrite a part/map to its info command into Area Communities Bot 🌊's database`)
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`part`)
         .setDescription(`🧱 add/overwrite a part to its info command into Area Communities Bot 🌊's database`)
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`obtained-through`)
               .setDescription(`📥 how is this part obtained?`)
               .setRequired(true)
               .setChoices({
                  name: `⬛ finding it out in the open`,
                  value: 0
               }, {
                  name: `🟥 crafting or part packs`,
                  value: 1
               }, {
                  name: `🟨 admin commands`,
                  value: 2
               })
         )
         .addBooleanOption(
            new Discord.SlashCommandBooleanOption()
               .setName(`show-in-list`)
               .setDescription(`📃 show this part in the list of part ids for everyone to see?`)
               .setRequired(true)
         )
   )
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`map`)
         .setDescription(`🗺️ add/overwrite a map to its info command into Area Communities Bot 🌊's database`)
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`game-mode`)
               .setDescription(`🎮 what game mode does this map fall under?`)
               .setRequired(true)
               .setChoices({
                  name: `🌊 survival`,
                  value: 0
               }, {
                  name: `🏃 escape`,
                  value: 1
               }, {
                  name: `⚔️ two-team elimination`,
                  value: 2
               },  {
                  name: `⚔️ four-team elimination`,
                  value: 3
               },  {
                  name: `👤 free-for-all`,
                  value: 4
               },  {
                  name: `⛵ boat`,
                  value: 5
               },  {
                  name: `💰 free money`,
                  value: 6
               })
         )
         .addBooleanOption(
            new Discord.SlashCommandBooleanOption()
               .setName(`show-in-list`)
               .setDescription(`📃 show this map in the list of maps for everyone to see?`)
               .setRequired(true)
         )
   )
   .setDefaultMemberPermissions(Discord.PermissionFlagsBits.Administrator);

// export const guildOnly = true;


import Discord from "discord.js";
import { strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const subcommand = interaction.options.getSubcommand();

   const option = interaction.options.getInteger(`obtained-through`)
      ?? interaction.options.getInteger(`game-mode`);

   const showInList = +interaction.options.getBoolean(`show-in-list`);


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`add-to-info:${subcommand}:${option}:${showInList}`)
      .setTitle(`${subcommand === `part` ? `🧱` : `🗺️`} add/overwrite a ${subcommand}`)
      .setComponents([
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`id`)
                  .setLabel(`ID`)
                  .setPlaceholder(`Fox`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setRequired(true)
            ),
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`formatted name`)
                  .setLabel(`FORMATTED NAME`)
                  .setPlaceholder(`🦊 fox`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setRequired(true)
            ),

         ...subcommand === `part`
            ? [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.TextInputBuilder()
                        .setCustomId(`flavour text`)
                        .setLabel(`FLAVOUR TEXT`)
                        .setPlaceholder(`Now introducing: a fox! [sic]`)
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(true)
                  ),
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.TextInputBuilder()
                        .setCustomId(`description`)
                        .setLabel(`DESCRIPTION`)
                        .setPlaceholder(strip`
                           - the fox is pretty unique because i said so
                           - yes, this is some sample text!!
                        `)
                        .setStyle(Discord.TextInputStyle.Paragraph)
                        .setRequired(true)
                  ),
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.TextInputBuilder()
                        .setCustomId(`crafting recipe`)
                        .setLabel(`CRAFTING RECIPE`)
                        .setPlaceholder(strip`
                           6 Wood
                           2 Oil
                           1 Plastic
                        `)
                        .setStyle(Discord.TextInputStyle.Paragraph)
                        .setRequired(false)
                  )
            ]

            : [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.TextInputBuilder()
                        .setCustomId(`creators`)
                        .setLabel(`CREATORS`)
                        .setPlaceholder(strip`
                           <roblox username> <roblox player id> [discord user id]
                           ...
                        `)
                        .setStyle(Discord.TextInputStyle.Paragraph)
                        .setRequired(true)
                  ),
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.TextInputBuilder()
                        .setCustomId(`modifiers`)
                        .setLabel(`MODIFIERS`)
                        .setPlaceholder(strip`
                           Normal
                           Supply Rafts
                           Open Hangars
                        `)
                        .setStyle(Discord.TextInputStyle.Paragraph)
                        .setRequired(true)
                  )
            ]
      ]);


   // show the modal
   return await interaction.showModal(modal);
};