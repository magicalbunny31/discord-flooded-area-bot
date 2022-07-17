import Discord from "discord.js";
import { choice } from "@magicalbunny31/awesome-utility-stuff";

/**
 * am
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // defer the interaction
   await interaction.deferReply();


   // meow~
   const meow = choice([
      `meow`, `nya`, `purr`, `mewo`
   ]);


   // add to the counter
   const timesUsed = await redis.HINCRBY(`flooded-area:commands:meow`, meow, 1);


   // edit the deferred reply
   return await interaction.editReply({
      content: `${meow}~ (😺 ${timesUsed})`
   });
};