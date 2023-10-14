export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";
import { noop } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Interaction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // this file is for ChatInputCommandInteractions
   if (!interaction.isChatInputCommand())
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


   // slash command permissions
   if (
      interaction.guild?.id === process.env.GUILD_FLOODED_AREA                                                                        // in flooded area
      && interaction.channel.id !== process.env.FA_CHANNEL_BOT_COMMANDS                                                               // chat-input application commands can only be run in bot commands
      && !interaction.member.roles.cache.has(process.env.FA_ROLE_MODERATION_TEAM)                                                     // by non-staff
      && !interaction.channel.isThread()                                                                                              // excluding threads
      && ![ `create-event`, `get-map-info`, `get-part-info`, `jump-to-top`, `mention`, `votekick` ].includes(interaction.commandName) // excluding /create-event, /get-map-info, /get-part-info, /jump-to-top, /mention, /votekick
   )
      return await interaction.reply({
         content: `### ❌ Commands can only be used in ${Discord.channelMention(process.env.FA_CHANNEL_BOT_COMMANDS)} or in threads.`,
         ephemeral: true
      });


   // get this file
   const name = [
      interaction.commandName,
      interaction.options.getSubcommandGroup(false),
      interaction.options.getSubcommand(false)
   ]
      .filter(Boolean)
      .join(` `);

   const file = interaction.client.interactions[`chat-input`].get(name);


   // this file isn't for this guild
   if (file.guilds[0] && !file.guilds.includes(interaction.guild?.id))
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