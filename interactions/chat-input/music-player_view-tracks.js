export const name = "music-player view-tracks";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT, process.env.GUILD_BUNNY_FURFEST ];


import Discord from "discord.js";
import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";

import musicPlayer from "../../data/music-player.js";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // data to show
   const data = {
      [process.env.GUILD_FLOODED_AREA]: {
         colour: colours.flooded_area,
         name:   `flooded-area`
      },

      [process.env.GUILD_SPACED_OUT]: {
         colour: colours.spaced_out,
         name:   `spaced-out`
      },

      [process.env.GUILD_BUNNY_FURFEST]: {
         colour: colours.flooded_area,
         name:   `flooded-area`
      }
   }[interaction.guild.id];


   // TODO
   if (interaction.guild.id === process.env.GUILD_SPACED_OUT)
      return await interaction.reply({
         content: strip`
            ### ❌ Tracks aren't available
            > - ${interaction.client.user} does not have access to the music for this game.
            > - Contact <@490178047325110282> to set-up this command.
         `,
         ephemeral: true
      });


   // category to view
   const categoryId = musicPlayer[data.name][0].categoryId;


   // defer the interaction
   await interaction.deferReply();


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(data.colour)
         .setAuthor({
            name: `Music Player`,
            iconURL: `attachment://Music_Player.webp`
         })
         .setDescription(
            musicPlayer[data.name]
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
                  musicPlayer[data.name]
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


   // files
   const files = [
      new Discord.AttachmentBuilder()
         .setFile(`./assets/music-player/Music_Player.webp`)
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds,
      components,
      files
   });
};