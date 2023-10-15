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


   // TODO a file is sent explaining all patterns temporarily, format these into images !!


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
               >  - ${emojis.foxsleep}
               > - If you don't sell your carrots by \`Sunday\` midnight GMT±0000, they'll turn into Rotten Carrots and will be added to your items.
               >  - These Rotten Carrots have no value but can be listed on the flea market.
               > - These patterns are similar (however, not *exactly* the same) as the ${Discord.hyperlink(`stalk market in the Animal Crossing series`, `https://nookipedia.com/wiki/Stalk_Market`)}.
            `
         })
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds,
      files: [
         new Discord.AttachmentBuilder()
            .setName(`patterns_and_events.txt`)
            .setFile(
               Buffer.from(strip`
                  # NOTE
                  - everything has changed! from start prices to decrease/increase intervals
                  - this is to introduce an element of "luck" when deciding to buy/sell carrots
                  - of course, if you're observant enough, you may notice some small differences between decrease/increase intervals: but you have to be on top of your game to figure them out~
                  - ..also, this file is temporary - i will visualise all this data for y'all soon
                  - have fun !!
                  - ~ bunny 🐾


                  ## patterns
                  
                  ### \`decreasing\`
                  - starts ##-##
                  - decreases every change by #-#
                  
                  ### \`increasing\`
                  - starts ##-##
                  - increases every change by #-#
                  
                  ### \`small-spike\`
                  - starts ##-##
                  - decreases every change by #-#
                  - news date at index #-# (###-###)
                  - increases three times by ##-##
                  - decreases to end to very low
                  
                  ### \`large-spike\`
                  - starts ##-##
                  - decreases every change by #-#
                  - news date at index #-# (###-###)
                  - increases one time by ##-##
                  - decreases one time by ##-##
                  - increases two times by ###-###
                  - decreases to end to very low
                  
                  ### \`false-spike\`
                  - starts ##-##
                  - decreases every change by #-#
                  - news date at index #-# (###-###)
                  - increases one time by ##-##
                  - decreases to end to very low
                  
                  ### \`low-random\`
                  - price set to ##-##
                  
                  ### \`high-random\`
                  - price set to ##-###
                  
                  ### \`starting-mirror\`
                  - starts ##-###
                  - news date at index #-# (###-###)
                  - decreases to news date until ##-##
                  - increases to end to end price (below)
                  - ends ##-##
                  
                  ### \`ending-mirror\`
                  - starts ##-##
                  - news date at index #-# (###-###)
                  - decreases to news date to ##-##
                  - increases to end to end price (below)
                  - ends ##-###
                  
                  ### \`peak\`
                  - starts ##-##
                  - news date at index #-# (###-###)
                  - increases to news date to ##-###
                  - decreases to end to end price (below)
                  - ends ##-##
                  
                  ## events
                  
                  ### market crash
                  - lasts for 3-5 days
                  - news comes day before to on the day
                  - happens any day
                  - inflation rate set to 0.5-1
                  - stalk market sell prices are divided by 4 (floored)
                  - stalk market buy prices are multiplied by 2
                  
                  ### bull market
                  - lasts for 1-2 days
                  - news comes day before
                  - happens any day
                  - stalk market sell prices are multiplied by 2
                  
                  ### market switch
                  - lasts for ½ day
                  - news comes day before
                  - happens mon-wed
                  - stalk market pattern will change to pattern (following pattern chances table)
               `)
            )
      ]
   });
};