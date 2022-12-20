import Discord from "discord.js";
import dayjs from "dayjs";
import { FieldValue, Timestamp } from "@google-cloud/firestore";

import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal submit info
   const [ _modal, button ] = interaction.customId.split(`:`);


   // fields
   const content = interaction
      .fields
      .getTextInputValue(`content`)
      .trim();


   // no content
   if (!content)
      return await interaction.reply({
         content: strip`
            ❌ **can't post note!**
            > a note can't be empty, duh
         `,
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // add this note to the notes
   await firestore.collection(`command`).doc(`notes`).update({
      notes: FieldValue.arrayUnion({
         id: interaction.id,
         user: interaction.user.id,
         content,
         "posted-at": new Timestamp(dayjs().unix(), 0)
      })
   });


   // edit the deferred interaction
   return await interaction.editReply({
      content: strip`
         ✅ **note posted!**
         > it will display on a board's next refresh, or when you next use ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`notes`, interaction.client.application.id)}
      `
   });
};