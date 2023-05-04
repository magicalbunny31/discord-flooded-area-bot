export const data = new Discord.SlashCommandBuilder()
   .setName(`acknowledgements`)
   .setDescription(`🎞️ acknowledgements about the area games by welololol`);


import Discord from "discord.js";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // defer the interaction
   await interaction.deferReply();


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setAuthor({
            name: `Flooded Area 🌊`,
            url: `https://www.roblox.com/games/3976767347/Flooded-Area`
         })
         .setDescription(strip`
            🧱 **game owner**
            > ${Discord.hyperlink(`welololol (@welololol)`, `https://www.roblox.com/users/137767563/profile`)}

            🛠️ **game developers**
            > <@240442941691133952> ${Discord.hyperlink(`Arlo (@ArloActually)`, `https://www.roblox.com/users/107306905/profile`)}
            > <@330380239735750658> ${Discord.hyperlink(`Doruk (@CrazyDoruk22)`, `https://www.roblox.com/users/139763594/profile`)}
            > <@381731359951159297> ${Discord.hyperlink(`Hugo (@wojtekhugo)`, `https://www.roblox.com/users/270964871/profile`)}

            💻 **ui designer**
            > <@374273730223931392> ${Discord.hyperlink(`Halo (@xXHaloEpicXx)`, `https://www.roblox.com/users/141712403/profile`)}

            🔧 **contractors and play-testers**
            > <@463762439658405889> ${Discord.hyperlink(`Guivegle (@Guivegle)`, `https://www.roblox.com/users/383056840/profile`)}
            > <@368128611225436162> ${Discord.hyperlink(`QuicklyBeans (QuicklyBeans)`, `https://www.roblox.com/users/1515713028/profile`)}
            > ${Discord.hyperlink(`pijus3002 (@pijus3002)`, `https://www.roblox.com/users/117080023/profile`)}

            ⚙️ **head of moderation**
            > <@705053696035127327> ${Discord.hyperlink(`MWMWMWMWMWMWMWMWMWMW (@ExplosssssiveGaming)`, `https://www.roblox.com/users/92146564/profile`)}

            🛡️ **moderators**
            > <@582178041967411201> ${Discord.hyperlink(`odds (@odds555)`, `https://www.roblox.com/users/410857522/profile`)}
            > <@216533284891525121> ${Discord.hyperlink(`eepy (@shougeo)`, `https://www.roblox.com/users/50624502/profile`)}
            > <@776627280498786355> ${Discord.hyperlink(`Melo (@Chaotic_ruins)`, `https://www.roblox.com/users/1305278651/profile`)}
            > <@721571859216203867> ${Discord.hyperlink(`nameicon (@nameicon)`, `https://www.roblox.com/users/552787517/profile`)}
            > <@955859143451869274> ${Discord.hyperlink(`RapidRuby (@lukamirka)`, `https://www.roblox.com/users/535425497/profile`)}

            🤖 **community bot developer**
            > <@490178047325110282> ${Discord.hyperlink(`magicalbuwunny31 (@magicalbunny31)`, `https://www.roblox.com/users/122462448/profile`)}

            🖼️ **thumbnail creator**
            > <@525093561910427670> ${Discord.hyperlink(`Legoiann (@Legoiann)`, `https://www.roblox.com/users/889863684/profile`)}
         `)
         .setImage(`attachment://flooded-area.png`)
         .setFooter({
            text: `magicalbunny31 : 2022 - 2023 🐾`,
            iconURL: interaction.client.emojis.cache.find(emoji => `${emoji}` === emojis.robot).url
         })
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`acknowledgements`)
               .setPlaceholder(`select a game.. 🐾`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Flooded Area`)
                     .setValue(`flooded area`)
                     .setEmoji(`🌊`)
                     .setDefault(true),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`???`) // TODO
                     .setValue(`space area`)
                     .setEmoji(`🛰️`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Sword Fight Area`)
                     .setValue(`sword fight area`)
                     .setEmoji(`⚔️`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Obby Area`)
                     .setValue(`obby area`)
                     .setEmoji(`🏝️`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Boss Area`)
                     .setValue(`boss area`)
                     .setEmoji(`☠️`)
               )
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setLabel(`official wiki`)
               .setEmoji(`📄`)
               .setStyle(Discord.ButtonStyle.Link)
               .setURL(`https://flooded-area-official.fandom.com/wiki/Flooded_Area_Official_Wiki`)
         )
   ];


   // files
   const files = [
      new Discord.AttachmentBuilder()
         .setFile(`./assets/flooded-area.png`)
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds,
      components,
      files
   });
};