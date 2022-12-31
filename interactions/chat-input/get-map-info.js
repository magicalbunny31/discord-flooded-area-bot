export const data = new Discord.SlashCommandBuilder()
   .setName(`get-map-info`)
   .setDescription(`🏷️ get some info on a map`)
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`map`)
         .setDescription(`🗺️ map to get info for`)
         .setAutocomplete(true)
         .setRequired(true)
   );


import Discord from "discord.js";
import fs from "fs/promises";

import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const mapId = interaction.options.getString(`map`);


   // defer the interaction
   await interaction.deferReply();


   // maps
   const maps = (await firestore.collection(`command`).doc(`get-map-info`).get()).data();
   const map = maps[mapId];


   // this option isn't in the maps array
   if (!map)
      return await interaction.editReply({
         content: strip`
            ❌ **\`${mapId}\` isn't a map!**
            > try selecting from the inline autocomplete choices for maps ${emojis.happ}
         `
      });


   // embeds
   const imageName = mapId.replace(/ |,/g, `_`);

   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setAuthor({
            name: map.name
         })
         .setThumbnail(`attachment://${imageName}.png`)
         .addFields({
            name: `👥 creators`,
            value: map.creators
               .map(creator =>
                  [
                     Discord.hyperlink(creator[`roblox-username`], `https://www.roblox.com/users/${creator[`roblox-id`]}/profile`),
                     creator[`discord-id`] ? `(${Discord.userMention(creator[`discord-id`])})` : null
                  ]
                     .filter(Boolean)
                     .join(` `)
               )
               .join(`\n`),
            inline: true
         }, {
            name: `🎮 game mode`,
            value: map[`game-mode`],
            inline: true
         }, {
            name: `🔮 modifiers`,
            value: map.modifiers
               .join(`\n`),
            inline: true
         }, {
            name: `🆔 id (case-sensitive)`,
            value: `\`${mapId.replace(/_/g, `.`)}\``,
            inline: false
         }),

      ...map.removed
         ? [
            new Discord.EmbedBuilder()
               .setColor(colours.red)
               .setDescription(strip`
                  ‼️ **this map has been removed from the game!**
                  > it cannot be played in-game anymore.. ${emojis.rip}
               `)
         ]
         : []
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds,

      files: (await fs.readdir(`./assets/maps`)).find(file => file === `${imageName}.png`)
         ? [
            new Discord.AttachmentBuilder()
               .setFile(`./assets/maps/${imageName}.png`)
               .setName(`${imageName}.png`)
               .setDescription(imageName)
         ]
         : []
   });
};