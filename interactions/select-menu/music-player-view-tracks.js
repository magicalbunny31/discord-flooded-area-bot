export const name = "music-player-view-tracks";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES, process.env.GUILD_BUNNY_FURFEST, process.env.GUILD_THE_HUB ];

import Discord from "discord.js";
import { colours } from "@magicalbunny31/awesome-utility-stuff";

import musicPlayer from "../../data/music-player.js";

/**
 * @param {Discord.StringSelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu ] = interaction.customId.split(`:`);
   const [ categoryId ] = interaction.values;


   // data to show
   const experienceData = {
      [process.env.GUILD_FLOODED_AREA]: {
         colour: colours.flooded_area,
         name:   `flooded-area`
      },

      [process.env.GUILD_UNIVERSE_LABORATORIES]: {
         colour: colours.spaced_out,
         name:   `spaced-out`
      },

      [process.env.GUILD_BUNNY_FURFEST]: {
         colour: colours.flooded_area,
         name:   `flooded-area`
      },

      [process.env.GUILD_THE_HUB]: {
         colour: colours.flooded_area,
         name:   `flooded-area`
      }
   }[interaction.guild.id];


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(experienceData.colour)
         .setAuthor({
            name: `Music Player`,
            iconURL: `attachment://Music_Player.webp`
         })
         .setDescription(
            musicPlayer[experienceData.name]
               .filter(data => data.categoryId === categoryId)
               .map(data => `- ${Discord.hyperlink(data.name, `https://create.roblox.com/marketplace/asset/${data.robloxAssetId}`)}`)
               .join(`\n`)
         )
   ];

   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`music-player-view-tracks`)
               .setPlaceholder(`Select a category...`)
               .setOptions(
                  musicPlayer[experienceData.name]
                     .filter((value, index, self) =>
                        index === self.findIndex(t => t.categoryId === value.categoryId)
                     )
                     .map(data =>
                        new Discord.StringSelectMenuOptionBuilder()
                           .setValue(data.categoryId)
                           .setLabel(data.categoryName)
                           .setEmoji(data.emoji)
                           .setDefault(data.categoryId === categoryId)
                     )
               )
         )
   ];


   // respond to the interaction
   const payload = {
      embeds,
      components
   };

   const isSameCommandUser = interaction.user.id === interaction.message.interaction?.user.id;
   const isEphemeral = interaction.message.flags.has(Discord.MessageFlags.Ephemeral);

   if (isSameCommandUser || isEphemeral)
      await interaction.update(payload);
   else
      await interaction.reply({
         ...payload,
         ephemeral: true
      });
};