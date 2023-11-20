export const name = "create-event";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import dayjs from "dayjs";
import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";

import cache from "../../data/cache.js";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal info
   const [ _modal, interactionId ] = interaction.customId.split(`:`);


   // fields
   const name        = interaction.fields.getTextInputValue(`name`)       .trim();
   const description = interaction.fields.getTextInputValue(`description`).trim();


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setTitle(`🗓️ Creating scheduled event`)
   ];


   // no reason
   if (!name)
      return await interaction.reply({
         embeds: [
            embeds[0]
               .setDescription(strip`
                  ### ❌ Cannot create scheduled event
                  > - You must input an event topic.
               `)
         ],
         ephemeral: true
      });


   // cache the fields
   const data = cache.get(interactionId);

   cache.set(interactionId, {
      ...data,
      name,
      description
   });


   // current timestamp for the event
   let timestamp = dayjs().startOf(`hour`).add(1, `hour`).unix();


   // embeds
   embeds[0]
      .setDescription(strip`
         ### ⌚ Select a date and time
         > - At ${Discord.time(timestamp, Discord.TimestampStyles.LongDateTime)}.
      `);


   // components
   const day  = 86400;
   const hour = 3600;

   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`create-event:${interactionId}:${timestamp}:${-day}`)
               .setLabel(`-1 day`)
               .setEmoji(`⏮️`)
               .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
               .setCustomId(`create-event:${interactionId}:${timestamp}:${-hour}`)
               .setLabel(`-1 hour`)
               .setEmoji(`⬅️`)
               .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
               .setCustomId(`create-event:${interactionId}:${timestamp}:${hour}`)
               .setLabel(`+1 hour`)
               .setEmoji(`➡️`)
               .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
               .setCustomId(`create-event:${interactionId}:${timestamp}:${day}`)
               .setLabel(`+1 day`)
               .setEmoji(`⏭️`)
               .setStyle(Discord.ButtonStyle.Primary)
         ),
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`create-event:${interactionId}:${timestamp}`)
               .setLabel(`Confirm date!`)
               .setEmoji(`🗓️`)
               .setStyle(Discord.ButtonStyle.Success)
         )
   ];


   // reply to the interaction
   await interaction.reply({
      embeds,
      components,
      ephemeral: true
   });
};