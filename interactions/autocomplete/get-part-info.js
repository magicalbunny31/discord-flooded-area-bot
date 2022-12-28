import Discord from "discord.js";
import { findSimilar } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.AutocompleteInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // autocomplete info
   const input = interaction.options.getFocused();


   // part names/ids
   const parts = Object.entries((await firestore.collection(`command`).doc(`get-part-info`).get()).data())
      .map(([ id, partInfo ]) =>
         ({
            name: partInfo.name,
            value: id
         })
      )
      .sort((a, b) => a.value.localeCompare(b.value));


   // no input, return first 25 parts
   if (!input)
      return await interaction.respond(
         parts.slice(0, 25)
      );


   // sort parts based on input
   const sortedParts = findSimilar(input, parts, {
      key: `name`,
      limit: 25,
      minScore: 0.1
   });


   // respond to the interaction
   return await interaction.respond(
      sortedParts.map(sortedPart => sortedPart.object)
   );
};