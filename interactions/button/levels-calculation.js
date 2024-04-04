export const name = "levels-calculation";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES ];

import Discord from "discord.js";
import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button ] = interaction.customId.split(`:`);


   // data to show
   const data = {
      [process.env.GUILD_FLOODED_AREA]: {
         colour: colours.flooded_area
      },

      [process.env.GUILD_UNIVERSE_LABORATORIES]: {
         colour: colours.spaced_out
      }
   }[interaction.guild.id];


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(data.colour)
         .setTitle(`❓ How are levels calculated?`)
         .setFields({
            name: `💬 Get experience from \`level\``,
            value: strip`
               \`\`\`
               10 × level²
               \`\`\`
            `,
            inline: true
         }, {
            name: `🏅 Get level from \`experience\``,
            value: strip`
               \`\`\`
               sqrt(experience ÷ 10)
               \`\`\`
            `,
            inline: true
         }, {
            name: `📈 Levelling as a function on a graph`,
            value: `> https://www.desmos.com/calculator/ubodcrzxou`
         })
   ];


   // reply to the interaction
   await interaction.reply({
      embeds,
      ephemeral: true
   });
};