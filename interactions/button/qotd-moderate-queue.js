export const name = "qotd-moderate-queue";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];


import Discord from "discord.js";
import dayjs from "dayjs";
import { Timestamp } from "@google-cloud/firestore";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, status, id ] = interaction.customId.split(`:`);


   // the current doc
   const qotdDocRef  = firestore.collection(`qotd`).doc(interaction.guildId).collection(`submissions`).doc(id);
   const qotdDocSnap = await qotdDocRef.get();
   const qotdDocData = qotdDocSnap.data();

   const { approve = [], deny = [] } = qotdDocData;


   // this user has already voted
   if (approve.includes(interaction.user.id) || deny.includes(interaction.user.id))
      return await interaction.deferUpdate();


   // add this user to the respective array
   status === `approve`
      ? approve.push(interaction.user.id)
      : deny   .push(interaction.user.id);


   // embeds
   const embeds = interaction.message.embeds.map(embed =>
      new Discord.EmbedBuilder(embed.data)
   );

   embeds[0].setFooter({
      text: ((embeds[0].data.footer?.text || ``) + `\n${status === `approve` ? `✅` : `❌`} @${interaction.user.username}`)
         .trim()
   });


   // payload for the message
   const payload = {
      embeds
   };


   // this submission was approved
   if (approve.length >= 2) {
      await qotdDocRef.update({
         approved: true
      });

      payload.components = [];
   };


   // this submission was denied
   if (deny.length >= 2) {
      await qotdDocRef.update({
         delete: new Timestamp(dayjs(interaction.createdAt).add(1, `week`).unix(), 0)
      });

      payload.components = [];
   };


   // count votes
   await qotdDocRef.update({
      approve, deny
   });


   // update the interaction's reply
   await interaction.update(payload);
};