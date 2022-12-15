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
         .setFile(`./assets/what-are-pronouns_brainpop.mp4`)
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setLabel(`further reading`)
               .setEmoji(`📰`)
               .setStyle(Discord.ButtonStyle.Link)
               .setURL(`https://uwm.edu/lgbtrc/support/gender-pronouns`)
         ])
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      files,
      components
   });
};