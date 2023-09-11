export const name = "game-info";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`game-info`)
   .setDescription(`View information about the game on Roblox`);


import Discord from "discord.js";
import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";

import pkg from "../../package.json" assert { type: "json" };

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // data to show
   const experienceData = {
      [process.env.GUILD_FLOODED_AREA]: {
         colour:     colours.flooded_area,
         id:         `flooded-area`,
         name:       `Flooded Area 🌊`,
         universeId: 1338193767,
         url:        `https://www.roblox.com/games/3976767347/Flooded-Area`
      },

      [process.env.GUILD_SPACED_OUT]: {
         colour:     colours.spaced_out,
         id:         `spaced-out`,
         name:       `Spaced Out 🌌`,
         universeId: 4746031883,
         url:        `https://www.roblox.com/games/13672239919/Spaced-Out`
      }
   }[interaction.guild.id];


   // user-agent string
   const userAgent = `${pkg.name}/${pkg.version} (https://github.com/${pkg.author}/${pkg.name})`;


   // defer the interaction
   await interaction.deferReply();


   // database
   const gameDocRef = firestore.collection(`historical-game-data`).doc(experienceData.id);
   const gameDocSnap = await gameDocRef.get();
   const gameDocData = gameDocSnap.data() || {};


   // get the latest info
   const timestamps = Object.keys(gameDocData);
   const latestTimestamp = Math.max(...timestamps);

   const info = gameDocData[latestTimestamp];


   // fetch game icon
   // https://thumbnails.roblox.com/docs#!/Games/get_v1_games_icons
   const icon = await (async () => {
      const response = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${experienceData.universeId}&size=512x512&format=Png&isCircular=false`, {
         headers: {
            "Accept": `application/json`,
            "User-Agent": userAgent
         }
      });

      if (response.ok)
         return (await response.json()).data[0].imageUrl;

      else
         return null;
   })();


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(experienceData.colour)
         .setAuthor({
            name: experienceData.name,
            iconURL: icon,
            url: experienceData.url
         })
         .setFields({
            name: `👤 Current Players`,
            value: `> \`${info[`current-players`].toLocaleString()}\` in-game`,
            inline: true
         }, {
            name: `⭐ Favourites`,
            value: `> \`${info.favourites.toLocaleString()}\` favourites`,
            inline: true
         }, {
            name: `👥 Total Visits`,
            value: `> \`${info[`total-visits`].toLocaleString()}\` total visits`,
            inline: true
         }, {
            name: `📈 Votes`,
            value: `> 👍 \`${info.votes.up.toLocaleString()}\` - \`${info.votes.down.toLocaleString()}\` 👎`,
            inline: true
         })
         .setTimestamp(latestTimestamp * 1000)
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`game-info:historical-game-data`)
               .setLabel(`View historical game data`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setEmoji(`📜`)
         )
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds,
      components
   });
};