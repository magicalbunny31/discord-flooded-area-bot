export const name = "what-are-pronouns";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // files
   const files = [
      new Discord.AttachmentBuilder()
         .setFile(`./assets/select-roles/what-are-pronouns_brainpop.mp4`)
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setLabel(`Further reading`)
               .setEmoji(`📰`)
               .setStyle(Discord.ButtonStyle.Link)
               .setURL(`https://uwm.edu/lgbtrc/support/gender-pronouns`)
         ])
   ];


   // edit the deferred interaction
   await interaction.editReply({
      files,
      components
   });
};