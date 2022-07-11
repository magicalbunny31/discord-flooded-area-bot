import Discord from "discord.js";
import { strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * edit the user's suggestion before sending
 * @param {Discord.ButtonInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // button info
   const [ _button, id ] = interaction.customId.split(`:`);


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
               yer can't edit your suggestions at this moment chef
               i'm trying to code this as fast as i can okai
               sorry!!
            `)
      ],
      ephemeral: true
   });
};