import Discord from "discord.js";
import { autoArray, choice } from "@magicalbunny31/awesome-utility-stuff";

/**
 * america
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // defer the interaction
   await interaction.deferReply();


   // america
   const america = choice([
      ...autoArray(97, () => ({ field: `america`,  content: `america`,                         emoji: `🇺🇸` })),
      {                         field: `amerwica`, content: `amerwica~ nyaa~`,                 emoji: `🇺🇸🐱` },
      {                         field: `acirema`,  content: `acirema`,                         emoji: `🇺🇸` },
      {                         field: `flood`,    content: `there is no america, only flood`, emoji: `<:Flood:983391790348509194>` }
   ]);


   // add to the counter
   const timesUsed = await redis.HINCRBY(`flooded-area:commands:america`, america.field, 1);


   // edit the deferred reply
   return await interaction.editReply({
      content: america.content !== `acirema`
         ? `${america.content} (${america.emoji} \`${timesUsed.toLocaleString()}\`)`
         : `(\`${timesUsed.toLocaleString()}\` ${america.emoji}) ${america.content}`
   });
};