export const name = "currency-create-flea-market-listing";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES ];

import Discord from "discord.js";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal info
   const [ _modal, itemSellerIdOrName ] = interaction.customId.split(`:`);


   // fields
   const rawPrice = interaction.fields.getTextInputValue(`price`).trim();
   const price    = +rawPrice;


   // data to show
   const data = {
      [process.env.GUILD_FLOODED_AREA]: {
         colour: colours.flooded_area
      },

      [process.env.GUILD_UNIVERSE_LABORATORIES]: {
         colour: colours.spaced_out
      }
   }[interaction.guild.id];


   // "defer" this reply
   // update the message if this is a command reply and this is the same command user as the select menu booper (or if the message is ephemeral)
   const isSameCommandUser = interaction.user.id === interaction.message.interaction?.user.id;
   const isEphemeral = interaction.message.flags.has(Discord.MessageFlags.Ephemeral);

   if (isSameCommandUser || isEphemeral) { // this is a ModalSubmitInteraction....this was meant for AnySelectMenuInteractions: i'll just pre-fill them lol
      const deferComponents            = interaction.message.components;
      const foundActionRowIndex        = 0;
      const foundSelectMenuIndex       = 0;
      const foundSelectMenuOptionIndex = deferComponents[foundActionRowIndex].components[foundSelectMenuIndex].options.findIndex(option    => option.value === itemSellerIdOrName);
      const options                    = deferComponents[foundActionRowIndex].components[foundSelectMenuIndex].data.options;

      for (const option of options)
         option.default = false;

      Object.assign(options[foundSelectMenuOptionIndex], {
         emoji: Discord.parseEmoji(emojis.loading),
         default: true
      });

      for (const actionRow of deferComponents)
         for (const component of actionRow.components)
            component.data.disabled = true;

      await interaction.update({
         components: deferComponents
      });

   } else // this isn't the same person who used the command: create a new reply to the interaction
      await interaction.deferReply({
         ephemeral: true
      });


   // commands
   const commands = await interaction.guild.commands.fetch();
   const commandCurrencyId = commands.find(command => command.name === `currency`)?.id || 0;


   // shop items
   const shopDocRef  = firestore.collection(`currency`).doc(interaction.guild.id);
   const shopDocSnap = await shopDocRef.get();
   const shopDocData = shopDocSnap.data() || {};


   // this user's currency
   const userCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(interaction.user.id);
   const userCurrencyDocSnap = await userCurrencyDocRef.get();
   const userCurrencyDocData = userCurrencyDocSnap.data() || {};


   // items
   const userItems = userCurrencyDocData.items || [];

   const itemToList = userItems
      .filter(item => (item.ref?.id || item.name) === itemSellerIdOrName)
      .reduce((val, acc) => val[`bought-for`] < acc[`bought-for`] ? val : acc);


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(data.colour)
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`currency-items:flea-market`)
               .setLabel(`Go back to your flea market listings`)
               .setStyle(Discord.ButtonStyle.Secondary)
               .setEmoji(`💸`)
         )
   ];


   // this user doesn't have this item
   if (!itemToList) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't list item on the flea market
            > - You don't own this item.
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // the inputted price isn't an integer
   if (isNaN(price) || !Number.isSafeInteger(price)) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't list item on the flea market
            > - \`${rawPrice}\` isn't a valid integer.
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // the inputted price is a negative number or 0
   if (price <= 0) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't list item on the flea market
            > - Enter a number greater than or equal to 1.
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // this item's name
   const itemName = itemToList.name
      || await (async () => {
         const itemSellerCurrencyDocRef  = itemToList.ref;
         const itemSellerCurrencyDocSnap = await itemSellerCurrencyDocRef.get();
         const itemSellerCurrencyDocData = itemSellerCurrencyDocSnap.data() || {};

         const item = itemSellerCurrencyDocData.item || {};
         return item.name;
      })();


   // this seller's personal item doesn't exist
   if (!itemName) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't list item on the flea market
            > - This seller's personal item no longer exists.
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // too many flea market listings
   const fleaMarket = shopDocData[`flea-market`] || [];

   if (fleaMarket.length >= 24) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't list item on the flea market
            > - The flea market is full (24 items listed). Come back again later when there's a free space!
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // this user has already listed another of this item on the flea market
   if (fleaMarket.some(item =>
      (
         (item.ref && itemToList.ref)
            ? item.ref.isEqual(itemToList.ref)
            : item.name === itemToList.name
      )
      && item.seller === interaction.user.id
   )) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't list item on the flea market
            > - You've already listed another of this item on the flea market.
         `);

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // list this item on the flea market
   fleaMarket.push({
      ...itemToList,
      price,
      seller: interaction.user.id
   });

   await shopDocRef.update({
      "flea-market": fleaMarket
   });


   // remove this itemToList from userItems
   userItems.splice(
      userItems.findIndex(item => (item.ref?.id || item.name) === itemSellerIdOrName && item[`bought-for`] === itemToList[`bought-for`]),
      1
   );

   await userCurrencyDocRef.update({
      items: userItems
   });


   // embeds
   embeds[0]
      .setDescription(strip`
         ### 💸 Listed \`${itemName}\` on the flea market for 🪙 \`${price}\` ${price === 1 ? `coin` : `coins`}!
         > - View it on the flea market with ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`currency`, `shop`, commandCurrencyId)}.
         >  - From there, you can also remove this item from the flea market for free.
      `);


   // edit the interaction
   await interaction.editReply({
      embeds,
      components
   });
};