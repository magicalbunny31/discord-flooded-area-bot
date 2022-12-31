import Discord from "discord.js";
import { findSimilar } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.AutocompleteInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // autocomplete info
   const input = interaction.options.getFocused();


   // map names/ids
   const maps = Object.entries((await firestore.collection(`command`).doc(`get-map-info`).get()).data())
      .map(([ id, mapInfo ]) =>
         ({
            name: mapInfo.name,
            value: id
         })
      )
      .sort((a, b) => a.value.localeCompare(b.value));


   // no input, return first 25 maps
   if (!input)
      return await interaction.respond(
         maps.slice(0, 25)
      );


   // sort maps based on input
   const sortedMaps = findSimilar(input, maps, {
      key: `name`,
      limit: 25,
      minScore: 0.1
   });


   // respond to the interaction
   return await interaction.respond(
      sortedMaps.map(sortedMap => sortedMap.object)
   );
};