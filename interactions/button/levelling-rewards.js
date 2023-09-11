export const name = "levelling-rewards";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

import Discord from "discord.js";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button ] = interaction.customId.split(`:`);


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // data to show
   const data = {
      [process.env.GUILD_FLOODED_AREA]: {
         colour: colours.flooded_area
      },

      [process.env.GUILD_SPACED_OUT]: {
         colour: colours.spaced_out
      }
   }[interaction.guild.id];


   // commands
   const commands = await interaction.guild.commands.fetch();
   const commandCurrencyId = commands.find(command => command.name === `currency`)?.id || 0;


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(data.colour)
         .setTitle(`📃 Levelling rewards`)
         .setFields(
            (() => {
               switch (interaction.guild.id) {
                  case process.env.GUILD_FLOODED_AREA: return [{
                     name: `${emojis.shield} \`Level 20\``,
                     value: strip`
                        > - ${Discord.roleMention(process.env.FA_ROLE_IMAGE_EMBED_PERMS)}
                     `
                  }];
                  case process.env.GUILD_SPACED_OUT: return [{
                     name: `❓ \`No levelling rewards.\``,
                     value: strip`
                        > - ${emojis.foxsleep}
                     `
                  }];
               };
            })()
         )
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds
   });
};