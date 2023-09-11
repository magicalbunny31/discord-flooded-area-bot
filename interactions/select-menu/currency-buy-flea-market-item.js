export const name = "currency-buy-flea-market-item";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

import Discord from "discord.js";
import { emojis, deferComponents, strip } from "@magicalbunny31/awesome-utility-stuff";

import shopResponses from "../../data/shop-responses.js";

/**
 * @param {Discord.StringSelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu ] = interaction.customId.split(`:`);
   const [ value ] = interaction.values;

   const [ itemOriginalSellerOrName, itemSeller ] = value.split(`:`);


   // "defer" this reply
   // update the message if this is a command reply and this is the same command user as the select menu booper (or if the message is ephemeral)
   const isSameCommandUser = interaction.user.id === interaction.message.interaction?.user.id;
   const isEphemeral = interaction.message.flags.has(Discord.MessageFlags.Ephemeral);

   if (isSameCommandUser || isEphemeral)
      await interaction.update({
         components: deferComponents(interaction.customId, interaction.values, interaction.message.components)
      });

   else // this isn't the same person who used the command: create a new reply to the interaction
      await interaction.deferReply({
         ephemeral: true
      });


   // items
   const shopDocRef  = firestore.collection(`currency`).doc(interaction.guild.id);
   const shopDocSnap = await shopDocRef.get();
   const shopDocData = shopDocSnap.data() || {};

   const fleaMarket = shopDocData[`flea-market`] || [];

   const items = (
      await Promise.all(
         fleaMarket
            .map(async data => {
               if (data.name) { // cool this item is a name, return it as it was
                  return data;

               } else { // this item has a DocumentRef
                  const itemDocSnap = await data.ref.get();     // fetch this user's personal item
                  const itemDocData = itemDocSnap.data() || {}; // get their personal item's data

                  if (!Object.values(itemDocData).length) // ok for some reason this user doesn't actually have a personal item
                     return null;

                  else
                     return { // return this item's name in the json too
                        ...data,
                        name: itemDocData.item.name
                     };
               };
            })
      )
   )
      .filter(Boolean); // `null` is present if there was no personal item present, just filter those out of the list


   // this user's currency
   const userCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(interaction.user.id);
   const userCurrencyDocSnap = await userCurrencyDocRef.get();
   const userCurrencyDocData = userCurrencyDocSnap.data() || {};


   // embeds
   const embeds = [
      new Discord.EmbedBuilder(interaction.message.embeds[0].data)
         .setFields(
            items.length
               ? items
                  .map(item =>
                     ({
                        name: item.name,
                        value: strip`
                           > Sold by ${Discord.userMention(item.seller)}
                           > Costs 🪙 \`${item.price.toLocaleString()}\` ${item.price === 1 ? `coin` : `coins`}
                        `,
                        inline: true
                     })
                  )
               : {
                  name: `No items to display`,
                  value: `> How about selling your own items in ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`currency`, `items`, interaction.commandId)}?`
               }
         )
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         })
   ];


   // this item's information
   const item = items.find(item => (item.ref?.id || item.name) === itemOriginalSellerOrName && item.seller === itemSeller);


   // embeds
   if (item)
      embeds[0]
         .setDescription(shopResponses[`flea-market`].ruby.viewing)
         .setFields({
            name: `${item.name}`,
            value: [
               `> - Seller: ${Discord.userMention(item.seller)}`,
               ...item.ref?.id
                  ? [ `>  - Originally from: ${Discord.userMention(item.ref?.id)}` ]
                  : [],
               `> - Cost: 🪙 \`${item.price.toLocaleString()}\` ${item.price === 1 ? `coin` : `coins`}`
            ]
               .join(`\n`)
         });


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`currency-shop`)
               .setPlaceholder(`Browse the marketplace...`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🏷️`)
                     .setLabel(`Items`)
                     .setValue(`shop-items`)
                     .setDescription(`🏪 bunny's shop`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🏬`)
                     .setLabel(`Special items`)
                     .setValue(`special-items`)
                     .setDescription(`🏪 bunny's shop`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🛍️`)
                     .setLabel(`Flea market`)
                     .setValue(`flea-market`)
                     .setDescription(`🐉 dragon deals`)
                     .setDefault(true),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🥕`)
                     .setLabel(`Stalk market`)
                     .setValue(`stalk-market`)
                     .setDescription(`🧺 your local carrot farm`)
               )
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`currency-buy-flea-market-item`)
               .setPlaceholder(`Select an item to buy...`)
               .setOptions(
                  items.length
                     ? items
                        .map(item =>
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(item.name)
                              .setDescription(`🪙 ${item.price.toLocaleString()} coins`)
                              .setValue(`${item.ref?.id || item.name}:${item.seller}`)
                              .setDefault((item.ref?.id || item.name) === itemOriginalSellerOrName && item.seller === itemSeller)
                        )
                     : new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`fox`)
                        .setValue(`fox`)
               )
               .setDisabled(!fleaMarket.length)
         ),

      ...item
         ? [
            new Discord.ActionRowBuilder()
               .setComponents(
                  item.seller !== interaction.user.id
                     ? new Discord.ButtonBuilder()
                        .setCustomId(`currency-buy-flea-market-item:${item.ref?.id || item.name}:${item.seller}`)
                        .setLabel(`Buy item`)
                        .setEmoji(`🛍️`)
                        .setStyle(Discord.ButtonStyle.Success)
                     : new Discord.ButtonBuilder()
                        .setCustomId(`currency-buy-flea-market-item:${item.ref?.id || item.name}:${item.seller}`)
                        .setLabel(`Remove item from flea market`)
                        .setEmoji(`📥`)
                        .setStyle(Discord.ButtonStyle.Secondary)
               )
         ]
         : []
   ];


   // edit the interaction
   await interaction.editReply({
      embeds,
      components
   });
};