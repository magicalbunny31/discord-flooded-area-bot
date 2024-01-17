export const name = "qotd-moderate-queue";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];


import Discord from "discord.js";
import { colours, choice } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, status, id ] = interaction.customId.split(`:`);


   // the current doc
   const qotdDocRef = firestore.collection(`qotd`).doc(id);


   // this submission was denied, delete it
   if (status === `deny`) {
      await qotdDocRef.delete();
      await interaction.message.delete();
      return;
   };


   // approve this suggestion
   await qotdDocRef.update({
      approved: true
   });


   // embeds
   const embeds = interaction.message.embeds.map(embed =>
      new Discord.EmbedBuilder(embed.data)
   );

   embeds[0].setFooter({
      text: `Approved by @${interaction.user.username}`
   });


   // update the interaction's original reply
   await interaction.update({
      embeds,
      components: []
   });
};