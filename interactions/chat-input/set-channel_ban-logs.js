import Discord from "discord.js";

/**
 * set a channel for where a specific type of suggestion's submissions should be sent to
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // options
   const channel = interaction.options.getChannel(`channel`);


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // set these values in the database
   await redis.SET(`flooded-area:channels:ban-logs`, channel.id);


   // edit the deferred interaction
   return await interaction.editReply({
      content: `Changed the ban logs channel to ${channel}.`
   });
};