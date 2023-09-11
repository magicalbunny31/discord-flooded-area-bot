export const name = "currency-how-shop-works";
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
         .setTitle(`❓ How does the shop work?`)
         .setDescription(`${emojis.currency_shopkeeper_bunny} thank you for choosing my currency commands as your source of entertainment!`)
         .setFields({
            name: `🪙 Earning coins`,
            value: strip`
               > - For every message you send in the server, every minute, you'll receive 🪙 \`1\` coin.
               > - During the weekend (Saturday and Sunday), your earn rate is doubled to 🪙 \`2\` coins.
               >  - These are __NOT__ coins in-game: only coins within ${interaction.client.user}.
            `
         }, {
            name: `🏷️ Items`,
            value: strip`
               > - These contain items listed from other server members!
               > - Every hour, the shop refreshes its items listed and can list up to 9 items.
               > - When you buy an item from **🏪 bunny's shop**...
               >  - 90% of the price paid goes to the item's seller.
               >  - 10% of the price paid goes to tax fees.
            `
         }, {
            name: `🏷️ Personal item`,
            value: strip`
               > - Your personal item is the item you sell in ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`currency`, `shop`, commandCurrencyId)} ➡️ **🏪 bunny's shop** ➡️ **🏷️ Items**.
               >  - It costs 🪙 \`100\` coins to create and update your item.
               > - When people buy your item, your item's quantity will decrease by the amount the bought.
               >  - It costs 25% of your personal item's listed price to increase its quantity by 1.
               > - To manage your personal item, use ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`currency`, `items`, commandCurrencyId)} ➡️ **🏷️ Personal item**.
            `
         }, {
            name: `🏬 Special items`,
            value: strip`
               > - Special items may appear here from to time.
               > - These items don't rotate every hour, and there can be up to 25 listings.
            `
         }, {
            name: `💸 Flea market`,
            value: strip`
               > - Flea market items that other people have owned and are now selling at their prices.
               > - These items don't rotate every hour, and there can be up to 25 listings.
               > - You can list an item you own here with ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`currency`, `items`, commandCurrencyId)} ➡️ **💸 Flea market**.
            `
         })
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds
   });
};