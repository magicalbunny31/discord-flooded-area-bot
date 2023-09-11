export const name = "music-player play category";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT, process.env.GUILD_BUNNY_FURFEST ];


import Discord from "discord.js";
import { findSimilar } from "@magicalbunny31/awesome-utility-stuff";

import musicPlayer from "../../data/music-player.js";

/**
 * @param {Discord.AutocompleteInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // autocomplete info
   const input = interaction.options.getFocused();


   // TODO
   if (interaction.guild.id === process.env.GUILD_SPACED_OUT)
      return await interaction.respond([]);


   // music to show
   const name = {
      [process.env.GUILD_FLOODED_AREA]:    `flooded-area`,
      [process.env.GUILD_SPACED_OUT]:      `spaced-out`,
      [process.env.GUILD_BUNNY_FURFEST]:   `flooded-area`,
      [process.env.GUILD_THE_HUB]:         `flooded-area`
   }[interaction.guild.id];


   // known in-game music categories
   const music = musicPlayer[name]
      .map(data =>
         ({
            name: `${data.emoji} ${data.categoryName}`,
            value: data.categoryId
         })
      )
      .filter((value, index, self) =>
         index === self.findIndex(t => t.value === value.value)
      );


   // find similar matches from the music list
   const foundMusic = findSimilar(input, music, {
      key: `name`,
      limit: 25,
      minScore: 0.1
   })
      .map(data => data.object);


   // respond to the interaction
   await interaction.respond(
      input
         ? foundMusic
         : music.slice(0, 25)
   );
};