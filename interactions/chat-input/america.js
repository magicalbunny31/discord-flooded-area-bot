export const data = new Discord.SlashCommandBuilder()
   .setName(`america`)
   .setDescription(`🇺🇸 america`);

export const guildOnly = true;


import Discord from "discord.js";
import { FieldValue } from "@google-cloud/firestore";

import { autoArray, choice } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // america
   const america = choice([
      ...autoArray(96889, () => ({ field: `america`,  content: `america`,                         emoji: `🇺🇸` })),
      ...autoArray(1000,  () => ({ field: `amerwica`, content: `amerwica~ nyaa~`,                 emoji: `🇺🇸🐱` })),
      ...autoArray(1000,  () => ({ field: `acirema`,  content: `acirema`,                         emoji: `🇺🇸` })),
      ...autoArray(1000,  () => ({ field: `flood`,    content: `there is no america, only flood`, emoji: `<:Flood:983391790348509194>` })),
      ...autoArray(100,   () => ({ field: `rare`,     content: `super rare america™️`,             emoji: `🇺🇸` })),
      ...autoArray(10,    () => ({ field: `rarer`,    content: `even more rarer america™️™️`,       emoji: `🇺🇸` })),
      {                            field: `british`,  content: `bri'ish`,                         emoji: `🇬🇧` }
   ]);


   // add to the counter
   const database = firestore.collection(`command`).doc(`america`);

   const { writeTime: { seconds: setAtTime } } = await database.update({
      [america.field]: FieldValue.increment(1)
   });


   // get the value of the counter
   const fetchedData = await database.get();

   const fetchedAtTime = fetchedData.updateTime.seconds;
   const timesUsed = setAtTime === fetchedAtTime
      ? fetchedData.data()[america.field]
      : fetchedData.data()[america.field] - 1; //? it probably incremented twice, remove one for this result


   // reply to the interaction
   return await interaction.reply({
      content: america.content !== `acirema`
         ? `${america.content} (${america.emoji} \`${timesUsed.toLocaleString()}\`)`
         : `(\`${timesUsed.toLocaleString()}\` ${america.emoji}) ${america.content}`
   });
};