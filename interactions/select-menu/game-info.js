export const name = "game-info";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES ];

import Discord from "discord.js";
import dayjs from "dayjs";
import Color from "color";
import { colours, deferComponents, strip } from "@magicalbunny31/awesome-utility-stuff";

import pkg from "../../package.json" assert { type: "json" };


/**
 * @param {Discord.StringSelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu, menu, currentExperience, currentData, currentGraph ] = interaction.customId.split(`:`);
   const [ experienceOrDataOrGraph ] = interaction.values;

   const experience =  menu === `experience` ? experienceOrDataOrGraph : currentExperience;
   const data       =  menu === `data`       ? experienceOrDataOrGraph : currentData;
   const graph      = (menu === `graph`      ? experienceOrDataOrGraph : currentGraph) || `current-players`;


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
      },

      "darkness-obby": {
         name:       `Darkness Obby 💡`,
         colour:     colours.spaced_out,
         universeId: 5745236823,
         url:        `https://www.roblox.com/games/16713821581/Spaced-Out`
      },

      "anarchy-chess": {
         name:       `Anarchy Chess ♟️`,
         colour:     colours.spaced_out,
         universeId: 5778315325,
         url:        `https://www.roblox.com/games/16813674681/Anarchy-Chess`
      }
   }[experience];


   // user-agent string
   const userAgent = `${pkg.name}/${pkg.version} (https://nuzzles.dev/area-communities-bot)`;


   // "defer" this reply
   // update the message if this is a command reply and this is the same command user as the button booper (or if the message is ephemeral)
   const isSameCommandUser = interaction.user.id === interaction.message.interaction?.user.id;
   const isEphemeral = interaction.message.flags.has(Discord.MessageFlags.Ephemeral);

   if (isSameCommandUser || isEphemeral)
      await interaction.update({
         components: deferComponents(interaction.customId, interaction.values, interaction.message.components)
      });

   else // this isn't the same person who used the command: create a new reply to the interaction
      await interaction.deferReply({
         ephemeral: true
      });


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
                     .setLabel(`Darkness Obby`)
                     .setValue(`darkness-obby`)
                     .setDefault(experience === `darkness-obby`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Anarchy Chess`)
                     .setValue(`anarchy-chess`)
                     .setDefault(experience === `anarchy-chess`),
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
                           .setDefault(data === `current`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Historical game data`)
                           .setValue(`historical`)
                           .setDefault(data === `historical`)
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
         // what game info to view
         switch (data) {


            // current game info
            case `current`: {
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
                           return (await response.json()).data[0]?.imageUrl;

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


               // break out
               break;
            };


            // historical game info
            case `historical`: {
               // database
               const gameDocRef = firestore.collection(`historical-game-data`).doc(experience);
               const gameDocSnap = await gameDocRef.get();
               const gameDocData = gameDocSnap.data() || {};


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


               // chart image
               // https://quickchart.io/documentation
               const purple = Color(experienceData.colour).hex();
               const green  = Color(colours.green)        .hex();
               const red    = Color(colours.red)          .hex();

               const name = {
                  "current-players": `Current players`,
                  "favourites":      `Favourites`,
                  "total-visits":    `Total visits`,
                  "votes":           `Votes`
               }[graph];

               const image = await (async () => {
                  const data = Object.entries(gameDocData);

                  const response = await fetch(`https://quickchart.io/chart`, {
                     body: JSON.stringify({
                        version: 4,
                        backgroundColor: `white`,
                        chart:
                           graph !== `votes`
                              ? {
                                 type: `line`,
                                 data: {
                                    labels: data.map(data =>
                                       dayjs.unix(data[0]).minute() === 0
                                          ? dayjs.duration({ seconds: data[0] - dayjs().unix() }).humanize(true)
                                          : ``
                                    ),
                                    datasets: [{
                                       backgroundColor: purple,
                                       borderColor: purple,
                                       data: data.map(data => data[1][graph]),
                                       fill: false,
                                       label: graph,
                                       pointBackgroundColor: purple
                                    }]
                                 },
                                 options: {
                                    plugins: {
                                       title: {
                                          display: true,
                                          text: `${experienceData.name} ${name} : ${dayjs.unix(Math.min(...data.map(data => data[0]))).utc().format(`DD/MMM/YYYY`)} - ${dayjs.unix(Math.max(...data.map(data => data[0]))).utc().format(`DD/MMM/YYYY`)}`
                                       }
                                    }
                                 }
                              }
                              : {
                                 type: `line`,
                                 data: {
                                    labels: data.map(data =>
                                       dayjs.unix(data[0]).minute() === 0
                                          ? dayjs.duration({ seconds: data[0] - dayjs().unix() }).humanize(true)
                                          : ``
                                    ),
                                    datasets: [{
                                       backgroundColor: green,
                                       borderColor: green,
                                       data: data.map(data => data[1].votes.up),
                                       fill: false,
                                       label: `upvotes`,
                                       pointBackgroundColor: purple,
                                       yAxisID: `up`
                                    }, {
                                       backgroundColor: red,
                                       borderColor: red,
                                       data: data.map(data => data[1].votes.down),
                                       fill: false,
                                       label: `downvotes`,
                                       pointBackgroundColor: purple,
                                       yAxisID: `down`
                                    }]
                                 },
                                 options: {
                                    scales: {
                                       up: {
                                          type: `linear`,
                                          display: true,
                                          position: `left`
                                       },
                                       down: {
                                          type: `linear`,
                                          display: true,
                                          position: `right`,
                                          grid: {
                                             drawOnChartArea: false
                                          }
                                       }
                                    },
                                    plugins: {
                                       title: {
                                          display: true,
                                          text: `${experienceData.name} ${name} : ${dayjs.unix(Math.min(...data.map(data => data[0]))).utc().format(`DD/MMM/YYYY`)} - ${dayjs.unix(Math.max(...data.map(data => data[0]))).utc().format(`DD/MMM/YYYY`)}`
                                       }
                                    }
                                 }
                              }
                     }),
                     headers: {
                        "Content-Type": `application/json`,
                        "User-Agent": userAgent
                     },
                     method: `POST`
                  });

                  return Buffer.from(await response.arrayBuffer());
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
                     .setImage(`attachment://${graph}.png`)
                     .setTimestamp()
               );


               // components
               components[0].components[0].setCustomId(`game-info:experience:${experience}:${data}:${graph}`);

               components[1].components[0].setCustomId(`game-info:data:${experience}:${data}:${graph}`);

               components.splice(2, 3,
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.StringSelectMenuBuilder()
                           .setCustomId(`game-info:graph:${experience}:${data}:${graph}`)
                           .setPlaceholder(`select the graph to view...`)
                           .setOptions(
                              new Discord.StringSelectMenuOptionBuilder()
                                 .setLabel(`Current players`)
                                 .setValue(`current-players`)
                                 .setDefault(graph === `current-players`),
                              new Discord.StringSelectMenuOptionBuilder()
                                 .setLabel(`Favourites`)
                                 .setValue(`favourites`)
                                 .setDefault(graph === `favourites`),
                              new Discord.StringSelectMenuOptionBuilder()
                                 .setLabel(`Total visits`)
                                 .setValue(`total-visits`)
                                 .setDefault(graph === `total-visits`),
                              new Discord.StringSelectMenuOptionBuilder()
                                 .setLabel(`Votes`)
                                 .setValue(`votes`)
                                 .setDefault(graph === `votes`)
                           )
                     )
               );


               // files
               files.push(
                  new Discord.AttachmentBuilder()
                     .setFile(image)
                     .setName(`${graph}.png`)
               );


               // break out
               break;
            };


         };


         // break out
         break;
      };


      // other-experiences
      case `other-experiences`: {
         // embeds
         embeds.push(
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setDescription(strip`
                  - **Boss Area**: *demo video* - [view video](https://youtu.be/SoA_wO-f32k)
                  - **Boss Area**: *victory screenshot* - [view image](https://nuzzles.dev/assets/discord/area-communities-bot/game-info/boss-area-victory-screenshot.png)
                  - **Sword Fight Area**, **Obby Area**, **Boss Area**: context from @welololol - [view image](https://nuzzles.dev/assets/discord/area-communities-bot/game-info/sword-fight-area-obby-area-boss-area-context-from-welololol.png)
               `)
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