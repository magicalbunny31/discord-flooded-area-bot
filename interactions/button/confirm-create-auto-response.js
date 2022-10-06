import Discord from "discord.js";
import { emojis, set } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, id = interaction.id ] = interaction.customId.split(`:`);


   // "defer" the interaction
   await interaction.update({
      content: `${emojis.loading} **\`creating auto-response..\`**`,
      components: []
   });


   // values for the auto-response
   let database = firestore.collection(`temporary-stuff`).doc(id);
   const {
      "rule-name":                ruleName,
      "message-content-contains": rawMessageContentContains,
      "reply-with":               replyWith
   } = (await database.get()).data();


   // set this data in the database
   const databasePayload = {
      [ruleName]: {
         "message-content-contains": set(
            rawMessageContentContains
               .split(`,`)
               .map(phrase => phrase.trim())
               .filter(Boolean)
         ),
         "reply-with": replyWith
      }
   };

   database = firestore.collection(`command`).doc(`auto-responses`);
   (await database.get()).data()
      ? await database.update(databasePayload) // update the document as it already exists
      : await database.set(databasePayload); // create the document as it not yet exists


   // edit the interaction
   return await interaction.editReply({
      content: `✅ **\`created auto-response!\`**`
   });
};