export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";
import { noop } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Interaction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // this file is for ModalSubmitInteractions
   if (!interaction.isModalSubmit())
      return;


   // fennec-utilities
   const isBlacklisted = interaction.client.blacklist?.includes(interaction.user.id);

   const developers = JSON.parse(process.env.DEVELOPERS.replaceAll(`'`, `"`));
   const isDeveloper = developers.includes(interaction.user.id);


   // this user is in the global blacklist
   if (isBlacklisted)
      return await interaction.client.fennec.notify(interaction, `blacklist`);


   // maintenance
   if (await interaction.client.fennec.getStatus() === `maintenance` && !isDeveloper)
      return await interaction.client.fennec.notify(interaction, `maintenance`);


   // modal info
   const [ modal ] = interaction.customId.split(`:`);


   // get this file
   const file = interaction.client.interactions[`modal-submit`].get(modal);


   // this file doesn't exist
   if (!file)
      return;


   // this file isn't for this guild
   if (interaction.inGuild() && !file.guilds.includes(interaction.guild.id))
      return;


   try {
      // run the file
      await file.default(interaction, firestore);


   } catch (error) {
      // an error occurred
      try {
         await interaction.client.fennec.respondToInteractionWithError(interaction);
         await interaction.client.fennec.sendError(error, Math.floor(interaction.createdTimestamp / 1000), interaction);

      } catch {
         noop;

      } finally {
         console.error(error.stack);
      };
   };


   // alerts
   const hasSeenAlertNotification =   await interaction.client.fennec.hasSeenNotification(interaction.user, `alert`);
   const isAlertNotification      = !!await interaction.client.fennec.getNotification(`alert`);

   if (!hasSeenAlertNotification && isAlertNotification) {
      await interaction.client.fennec.notify(interaction, `alert`);
      await interaction.client.fennec.setSeenNotification(interaction.user, `alert`);
   };


   // offline soon
   const hasSeenOfflineSoonNotification = await interaction.client.fennec.hasSeenNotification(interaction.user, `offline-soon`);

   if (await interaction.client.fennec.getStatus() === `offline-soon` && !hasSeenOfflineSoonNotification) {
      await interaction.client.fennec.notify(interaction, `offline-soon`);
      await interaction.client.fennec.setSeenNotification(interaction.user, `offline-soon`);
   };
};