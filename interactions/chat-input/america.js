import Discord from "discord.js";

/**
 * view current statistics for flooded area on roblox
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // defer the interaction
   await interaction.deferReply();


   // add to the counter
   const timesUsed = await redis.INCR(`flooded-area:commands:america`);


   // edit the deferred reply
   return await interaction.editReply({
      content: `america`,
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(0x4de94c)
            .setFooter({
               text: `${timesUsed}`
            })
      ]
   });
};