import Discord from "discord.js";
import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * show the reaction roles
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // database stuff
   const database = firestore.collection(`role`).doc(`moderation-team`);
   const { role: moderationTeam } = (await database.get()).data();


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
      content: strip`
         pronoun roles are simply here to make it easier for everyone to refer to one another!
         misusing the roles will result in punishment
         please be mature about this ${emojis.happ}
         ~ ${Discord.roleMention(moderationTeam)}
      `,
      files,
      components
   });
};