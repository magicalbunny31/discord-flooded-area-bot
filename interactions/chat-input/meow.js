import Discord from "discord.js";
import { autoArray, choice } from "@magicalbunny31/awesome-utility-stuff";

/**
 * nya~
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // defer the interaction
   await interaction.deferReply();


   // nya~
   const meow = choice([
      ...autoArray(24, () => ({ field: `meow`,   content: `meow~`,   emoji: `😺` })),
      ...autoArray(24, () => ({ field: `nya`,    content: `nya~`,    emoji: `😺` })),
      ...autoArray(24, () => ({ field: `purr`,   content: `purr~`,   emoji: `😺` })),
      ...autoArray(24, () => ({ field: `mewo`,   content: `mewo~`,   emoji: `😺` })),
      {                         field: `cursed`, content: `m̴͔͑ ̷̬͒e̶̽̑ ̸̛̫ǒ̷̊ ̴̃̔w̸̏͘`, emoji: `🐈‍⬛` },
      {                         field: `dog`,    content: `woof`,    emoji: `🐶` },
      {                         field: `wolf`,   content: `awoo`,    emoji: `🐺` },
      {                         field: `fox`,    content: `yip`,     emoji: `🦊` }
   ]);


   // add to the counter
   const timesUsed = await redis.HINCRBY(`flooded-area:commands:meow`, meow.field, 1);


   // edit the deferred reply
   return await interaction.editReply({
      content: `${meow.content} (${meow.emoji} \`${timesUsed.toLocaleString()}\`)`
   });
};