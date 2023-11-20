export const name = "game-info";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`game-info`)
   .setDescription(`View information about welololol's Games inc/Universe Laboratories' on Roblox`)
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`experience`)
         .setDescription(`Start the menu on a specific experience`)
         .setChoices({
            name: `Flooded Area`,
            value: `flooded-area`
         }, {
            name: `Spaced Out`,
            value: `spaced-out`
         }, {
            name: `Other experiences`,
            value: `other-experiences`
         })
         .setRequired(false)
   );


import Discord from "discord.js";
import { colours } from "@magicalbunny31/awesome-utility-stuff";

import pkg from "../../package.json" assert { type: "json" };

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const experience = interaction.options.getString(`experience`) || `flooded-area`;

   const data = "current";


   // data to show
   const experienceData = {
      "flooded-area": {
         name:       `Flooded Area 🌊`,
         colour:     colours.flooded_area,
         universeId: 1338193767,
         url:        `https://www.roblox.com/games/3976767347/Flooded-Area`
      },

      "spaced-out": {
         name:       `Spaced Out 🌌`,
         colour:     colours.spaced_out,
         universeId: 4746031883,
         url:        `https://www.roblox.com/games/13672239919/Spaced-Out`
      }
   }[experience];


   // user-agent string
   const userAgent = `${pkg.name}/${pkg.version} (https://nuzzles.dev/area-communities-bot)`;


   // defer the interaction
   await interaction.deferReply();


   // embeds
   const embeds = [];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`game-info:experience:${experience}:${data}`)
               .setPlaceholder(`Select an experience to view info on...`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Flooded Area`)
                     .setValue(`flooded-area`)
                     .setDefault(experience === `flooded-area`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Spaced Out`)
                     .setValue(`spaced-out`)
                     .setDefault(experience === `spaced-out`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Other experiences`)
                     .setValue(`other-experiences`)
                     .setDescription(`Sword Fight Area, Obby Area, Boss Area`)
                     .setDefault(experience === `other-experiences`)
               )
         ),

      ...experience !== `other-experiences`
         ? [
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`game-info:data:${experience}:${data}`)
                     .setPlaceholder(`Select the type of data to view...`)
                     .setOptions(
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Current game data`)
                           .setValue(`current`)
                           .setDefault(true),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Historical game data`)
                           .setValue(`historical`)
                     )
               )
         ]
         : []
   ];


   // files
   const files = [];


   // show different embeds based on the selected experience
   switch (experience) {


      // flooded-area
      // spaced-out
      default: {
         // database
         const gameDocRef = firestore.collection(`historical-game-data`).doc(experience);
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
         embeds.push(
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
         );


         // break out
         break;
      };


      // other-experiences
      case `other-experiences`: {
         // embeds
         embeds.push(
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setImage(`attachment://other-experiences.png`)
               .setFooter({
                  text: `Before anyone asks...Yeah, I have permission from @welololol to share these attachments!`
               })
         );


         // files
         files.push(
            new Discord.AttachmentBuilder()
               .setFile(`./assets/game-info/other-experiences.png`),
            new Discord.AttachmentBuilder()
               .setFile(`./assets/game-info/boss-area.mp4`),
            new Discord.AttachmentBuilder()
               .setFile(`./assets/game-info/boss-area.png`)
         );


         // break out
         break;
      };


   };


   // edit the deferred interaction
   await interaction.editReply({
      embeds,
      components,
      files
   });
};