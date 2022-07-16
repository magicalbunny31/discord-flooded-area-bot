import Discord from "discord.js";

/**
 * view current statistics for flooded area on roblox
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   return await interaction.reply({
      content: `uhm hii 👉👈`,
      ephemeral: true
   });
};