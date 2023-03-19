import Discord from "discord.js";
import { FieldValue } from "@google-cloud/firestore";

/**
 * @param {Discord.AnySelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu, type ] = interaction.customId.split(`:`);
   const [ member ] = interaction.values;


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // set these strings in the database
   if (type === `add`) { // add members
      try {
         await firestore.collection(`report-a-player`).doc(`blacklist`).update({
            members: FieldValue.arrayUnion(member)
         });

      } catch {
         await firestore.collection(`report-a-player`).doc(`blacklist`).set({
            members: [
               member
            ]
         });
      };


   } else // remove members
      await firestore.collection(`report-a-player`).doc(`blacklist`).update({
         members: FieldValue.arrayRemove(member)
      });


   // edit the deferred interaction
   return await interaction.editReply({
      content: type === `add`
         ? `➕ Added ${Discord.userMention(member)} to the blacklist!`
         : `➖ Removed ${Discord.userMention(member)} from the blacklist!`,
      allowedMentions: {
         parse: []
      }
   });
};