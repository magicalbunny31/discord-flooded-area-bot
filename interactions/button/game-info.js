export const name = "game-info";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

import Discord from "discord.js";
import dayjs from "dayjs";
import { colours, deferComponents } from "@magicalbunny31/awesome-utility-stuff";

import pkg from "../../package.json" assert { type: "json" };

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, section ] = interaction.customId.split(`:`);


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


   // "defer" this reply
   // update the message if this is a command reply and this is the same command user as the button booper (or if the message is ephemeral)
   const isSameCommandUser = interaction.user.id === interaction.message.interaction?.user.id;
   const isEphemeral = interaction.message.flags.has(Discord.MessageFlags.Ephemeral);

   if (isSameCommandUser || isEphemeral)
      await interaction.update({
         components: deferComponents(interaction.customId, interaction.message.components)
      });

   else // this isn't the same person who used the command: create a new reply to the interaction
      await interaction.deferReply({
         ephemeral: true
      });


   // database
   const gameDocRef = firestore.collection(`historical-game-data`).doc(experienceData.id);
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


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            section === `game-info`
               ? new Discord.ButtonBuilder()
                  .setCustomId(`game-info:historical-game-data`)
                  .setLabel(`View historical game data`)
                  .setStyle(Discord.ButtonStyle.Primary)
                  .setEmoji(`📜`)
               : new Discord.ButtonBuilder()
                  .setCustomId(`game-info:game-info`)
                  .setLabel(`View game info`)
                  .setStyle(Discord.ButtonStyle.Primary)
                  .setEmoji(`🎮`)
         )
   ];


   // what section to view
   switch (section) {


      // game info
      case `game-info`: {
         // get the latest info
         const timestamps = Object.keys(gameDocData);
         const latestTimestamp = Math.max(...timestamps);

         const info = gameDocData[latestTimestamp];


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


         // edit the interaction's original reply
         return await interaction.editReply({
            embeds,
            components,
            files: []
         });
      };


      // historical game data images
      case `historical-game-data`: {
         // function to create a chart
         // https://quickchart.io/documentation
         const createChartImage = async (key, colour, name) => {
            const data = Object.entries(gameDocData);

            const response = await fetch(`https://quickchart.io/chart`, {
               body: JSON.stringify({
                  version: 4,
                  backgroundColor: `white`,
                  chart: {
                     type: `line`,
                     data: {
                        labels: data.map(data =>
                           dayjs.unix(data[0]).minute() === 0
                              ? dayjs.duration({ seconds: data[0] - dayjs().unix() }).humanize(true)
                              : ``
                        ),
                        datasets: [{
                           backgroundColor: colour,
                           borderColor: colour,
                           data: data.map(data => data[1][key]),
                           fill: false,
                           label: name,
                           pointBackgroundColor: `#4815aa`
                        }]
                     },
                     options: {
                        elements: {
                           line: {
                              tension: 0.4
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
         };


         // chart images
         const charts = [{
            name: `current-players`,
            colour: colours.blue,
            image: await createChartImage(`current-players`, `#3783ff`, `Current Players`)
         }, {
            name: `favourites`,
            colour: colours.orange,
            image: await createChartImage(`favourites`, `#ff8c00`, `Favourites`)
         }, {
            name: `total-visits`,
            colour: colours.yellow,
            image: await createChartImage(`total-visits`, `#ffee00`, `Total Visits`)
         }, {
            name: `votes`,
            colour: colours.flooded_area,
            image: await (async () => {
               const data = Object.entries(gameDocData);

               const response = await fetch(`https://quickchart.io/chart`, {
                  body: JSON.stringify({
                     version: 4,
                     backgroundColor: `white`,
                     chart: {
                        type: `line`,
                        data: {
                           labels: data.map(data =>
                              dayjs.unix(data[0]).minute() === 0
                                 ? dayjs.duration({ seconds: data[0] - dayjs().unix() }).humanize(true)
                                 : ``
                           ),
                           datasets: [{
                              backgroundColor: `#4de94c`,
                              borderColor: `#4de94c`,
                              data: data.map(data => data[1].votes.up),
                              fill: false,
                              label: `Upvotes`,
                              pointBackgroundColor: `#4815aa`,
                              yAxisID: `up`
                           }, {
                              backgroundColor: `#f60000`,
                              borderColor: `#f60000`,
                              data: data.map(data => data[1].votes.down),
                              fill: false,
                              label: `Downvotes`,
                              pointBackgroundColor: `#4815aa`,
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
                           elements: {
                              line: {
                                 tension: 0.4
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
            })()
         }];


         // embeds
         const embeds = charts.map(data =>
            new Discord.EmbedBuilder()
               .setColor(data.colour)
               .setAuthor({
                  name: experienceData.name,
                  iconURL: icon,
                  url: experienceData.url
               })
               .setImage(`attachment://${data.name}.png`)
         );


         // files
         const files = charts.map(data =>
            new Discord.AttachmentBuilder()
               .setFile(data.image)
               .setName(`${data.name}.png`)
         );


         // edit the interaction's original reply
         return await interaction.editReply({
            embeds,
            components,
            files
         });
      };


   };
};