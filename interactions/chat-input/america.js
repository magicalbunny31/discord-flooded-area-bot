import Discord from "discord.js";
import { autoArray, choice } from "@magicalbunny31/awesome-utility-stuff";

/**
 * america
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // america
   const america = choice([
      ...autoArray(969, () => ({ field: `america`,  content: `america`,                         emoji: `🇺🇸` })),
      ...autoArray(10,  () => ({ field: `amerwica`, content: `amerwica~ nyaa~`,                 emoji: `🇺🇸🐱` })),
      ...autoArray(10,  () => ({ field: `acirema`,  content: `acirema`,                         emoji: `🇺🇸` })),
      ...autoArray(10,  () => ({ field: `flood`,    content: `there is no america, only flood`, emoji: `<:Flood:983391790348509194>` })),
      {                          field: `rare`,     content: `super rare america™️`,             emoji: `🇺🇸` }
   ]);


   // add to the counter
   const timesUsed = await redis.HINCRBY(`flooded-area:commands:america`, america.field, 1);


   // reply to the interaction
   return await interaction.reply({
      content: america.content !== `acirema`
         ? `${america.content} (${america.emoji} \`${timesUsed.toLocaleString()}\`)`
         : `(\`${timesUsed.toLocaleString()}\` ${america.emoji}) ${america.content}`
   });
};