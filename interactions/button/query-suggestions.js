import Discord from "discord.js";
import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * send the user's suggestion to its suggestion channel
 * @param {Discord.ButtonInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // button info
   const [ _button, type ] = interaction.customId.split(`:`);


   const magicalbunny31 = await interaction.client.users.fetch(`490178047325110282`, { force: true });
   return await interaction.reply({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(magicalbunny31.accentColor)
            .setAuthor({
               name: magicalbunny31.tag,
               iconURL: magicalbunny31.displayAvatarURL(),
               url: `https://nuzzles.dev`
            })
            .setDescription(strip`
               feature under development, come back later~

               ..or actually
               - go to <#977267452050280498>
               - use the command ${emojis.flooded_area} **/view-suggestions**
            `)
      ],
      ephemeral: true
   });
};