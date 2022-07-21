import Discord from "discord.js";
import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * demo of something and something blah blah, i don't know
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // only magicalbunny31 🐾 can use this command
   const magicalbunny31 = `490178047325110282`;

   if (interaction.user.id !== magicalbunny31)
      return await interaction.reply({
         content: strip`
            hello member with administrator permissions
            please ignore this command
            kthx ${emojis.happ}
         `,
         ephemeral: true
      });


   await interaction.reply({
      content: `nothing to see here owo`,
      ephemeral: true
   });
};