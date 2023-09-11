export const name = "currency-how-stalk-market-works";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

import Discord from "discord.js";
import { emojis, colours, strip } from "@magicalbunny31/awesome-utility-stuff";

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

      [process.env.GUILD_SPACED_OUT]: {
         colour: colours.spaced_out
      }
   }[interaction.guild.id];


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // commands
   const commands = await interaction.guild.commands.fetch();
   const commandCurrencyId = commands.find(command => command.name === `currency`)?.id || 0;


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(data.colour)
         .setTitle(`❓ How does the stalk market work?`)
         .setFields({
            name: `💳 Buying carrots`,
            value: strip`
               > - Carrots can be bought from the ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`currency`, `shop`, commandCurrencyId)} on \`Sunday\`s GMT±0000.
               > - They'll be on sale from 🪙 \`45\` coins to 🪙 \`55\` coins.
            `
         }, {
            name: `💰 Selling carrots`,
            value: strip`
               > - Carrots can be sold at the ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`currency`, `shop`, commandCurrencyId)} from \`Monday\` GMT±0000 time to \`Saturday\` GMT±0000 time.
               > - Prices change every 12 hours (00:00 and 12:00, GMT±0000) and will follow one of four patterns:
               >  - Decreasing: carrot prices will keep decreasing.
               >  - Small-spike: carrot prices will increase a small amount at a random period of the week.
               >  - Large-spike: carrot prices will increase a large amount at a random period of the week.
               >  - Random: carrot prices will fluctuate randomly.
               > - If you don't sell your carrots by \`Sunday\` midnight GMT±0000, they'll turn into Rotten Carrots and will be added to your items.
               >  - These Rotten Carrots have no value but can be listed on the flea market.
               > - These patterns are similar (however, not *exactly* the same) as the ${Discord.hyperlink(`stalk market in the Animal Crossing series`, `https://nookipedia.com/wiki/Stalk_Market`)}.
            `
         })
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds
   });
};