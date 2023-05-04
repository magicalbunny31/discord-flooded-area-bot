export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";
import { emojis } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Interaction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // function to try to fetch something or return undefined instead of throwing
   const tryOrUndefined = async promise => {
      try {
         return await promise;
      } catch {
         return undefined;
      };
   };


   // this file is for ButtonInteractions
   if (!interaction.isButton())
      return;


   // this user is in the global blacklist
   if (interaction.client.blacklist.includes(interaction.user.id))
      return await interaction.client.fennec.warnBlacklisted(interaction, process.env.SUPPORT_GUILD);


   // maintenance
   if (await interaction.client.fennec.getStatus() === `maintenance`)
      if (!JSON.parse(process.env.DEVELOPERS.replaceAll(`'`, `"`)).includes(interaction.user.id))
         return await interaction.client.fennec.warnMaintenance(interaction);


   // button info
   const [ button ] = interaction.customId.split(`:`);


   // the start of this button is probably an id
   if (+button)
      return;


   // get this button's file
   const file = await tryOrUndefined(import(`../interactions/button/${button}.js`));


   // this file doesn't exist
   if (!file)
      return await interaction.reply({
         content: `${emojis.rip} **\`this button doesn't work - sorry!\`**`,
         ephemeral: true
      });


   try {
      // run the file
      await file.default(interaction, firestore);


   } catch (error) {
      // an error occurred
      try {
         await interaction.client.fennec.respondToInteractionWithError(interaction);
         return await interaction.client.fennec.sendError(error, Math.floor(interaction.createdTimestamp / 1000), interaction);

      } finally {
         return console.error(error.stack);
      };
   };
};