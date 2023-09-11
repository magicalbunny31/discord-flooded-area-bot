export const name = "create-event";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import dayjs from "dayjs";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

import cache from "../../data/cache.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, interactionId, rawTimestamp, rawDurationDifference ] = interaction.customId.split(`:`);

   let   timestamp          = +rawTimestamp;
   const durationDifference = +rawDurationDifference;


   // scheduled event data
   const data = cache.get(interactionId);


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setTitle(`🗓️ Creating scheduled event`)
   ];


   // create the event
   if (!rawDurationDifference) {
      // timestamp is in the past
      if (timestamp < dayjs().unix())
         return await interaction.update({
            embeds: [
               embeds[0]
                  .setTitle(`❌ Failed to create scheduled event`)
                  .setDescription(`Your start date must be a date in the future.`)
            ],
            components: []
         });


      // embeds
      embeds[0]
         .setDescription(strip`
            ${emojis.loading} This'll take a few seconds: your scheduled event is being created...
         `);


      // update the interaction
      await interaction.update({
         embeds,
         components: []
      });


      // create guild scheduled event
      const scheduledEvent = await interaction.guild.scheduledEvents.create({
         name:               data.name,
         scheduledStartTime: timestamp * 1000,
         privacyLevel:       Discord.GuildScheduledEventPrivacyLevel.GuildOnly,
         entityType:         Discord.GuildScheduledEventEntityType.Voice,
         description:        data.description,
         channel:            process.env.FA_CHANNEL_EVENTS,
         image:              data.image,
         reason:             `@${interaction.user.username} (${interaction.user.id}) used /create-event`
      });


      // embeds
      embeds[0]
         .setTitle(`🎉 All set. Now share your event!`)
         .setDescription(`Copy the event link above to invite people to your event. This also acts as a server invite link.`);


      // edit the interaction's original reply
      return await interaction.editReply({
         content: scheduledEvent.url,
         embeds
      });
   };


   // current timestamp for the event
   timestamp += durationDifference;


   // embeds
   embeds[0]
      .setDescription(strip`
         ### ⌚ Select a date and time.
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
   await interaction.update({
      embeds,
      components
   });
};