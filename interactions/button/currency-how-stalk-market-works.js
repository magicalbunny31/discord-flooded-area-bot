export const name = "currency-how-stalk-market-works";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES ];

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

      [process.env.GUILD_UNIVERSE_LABORATORIES]: {
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
         .setDescription(strip`
            ### ${emojis.currency_shopkeeper_deerie} A deer's guide to the stalk market
            > - Every Sunday, you'll have the option to buy some carrots.
            >  - These will have a fixed buy price.
            > - After buying carrots, you can sell them on any day except Sunday. The price of carrots will change every 12 hours (00:00 and 12:00, GMT±0000).
            > - The prices of the carrots will follow a pattern, similarly to the ${Discord.hyperlink(`stalk market in the Animal Crossing series`, `https://nookipedia.com/wiki/Stalk_Market`)}.

            ### ${emojis.announcement_channel} Community resources
            > - For more information about carrot price patterns, general tips, and questions...
            >  - See the Pinned Messages in ${Discord.channelMention(`1140342617247334420`)}.
         `)
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds
   });
};