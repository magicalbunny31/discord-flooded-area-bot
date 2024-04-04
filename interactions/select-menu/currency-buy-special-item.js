export const name = "currency-buy-special-item";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES ];

import Discord from "discord.js";
import dayjs from "dayjs";
import { deferComponents } from "@magicalbunny31/awesome-utility-stuff";

import shopResponses from "../../data/shop-responses.js";

/**
 * @param {Discord.StringSelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu ] = interaction.customId.split(`:`);
   const [ value ] = interaction.values;

   const [ itemName ] = value.split(`:`);


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

   const specialItems = shopDocData[`special-items`] || [];


   // this user's currency
   const userCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(interaction.user.id);
   const userCurrencyDocSnap = await userCurrencyDocRef.get();
   const userCurrencyDocData = userCurrencyDocSnap.data() || {};


   // who's in charge of bunny's shop
   /**
    * halo  : 10:00 - 03:59  |  halo         : 10:00 - 15:59
    *                        |  halo + bunny : 16:00 - 03:59
    * bunny : 16:00 - 09:59  |         bunny : 04:00 - 09:59
    */
   const bunnyShopShopkeeper = (() => {
      const hour = dayjs.utc().hour();
      switch (true) {
         case 10 <= hour && hour < 16: return shopResponses[`special-items`].halo;
         default:                      return shopResponses[`special-items`].haloBunny;
         case  4 <= hour && hour < 10: return shopResponses[`special-items`].    bunny;
      };
   })();


   // embeds
   const embeds = [
      new Discord.EmbedBuilder(interaction.message.embeds[0].data)
         .setDescription(bunnyShopShopkeeper.viewing)
         .setFields([
            ...specialItems
               .map(item =>
                  ({
                     name: item.name,
                     value: `> Costs 🪙 \`${item.price.toLocaleString()}\` ${item.price === 1 ? `coin` : `coins`}`,
                     inline: true
                  })
               ),
            {
               name: `\u200b`,
               value: `🏬 **Special items** last updated ${
                  Discord.time(
                     interaction.createdAt,
                     Discord.TimestampStyles.RelativeTime
                  )
               }`
            }
         ])
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         })
   ];


   // this item's information
   const item = specialItems.find(item => item.name === itemName);


   // embeds
   if (item)
      embeds[0]
         .setDescription(bunnyShopShopkeeper.viewing)
         .setFields({
            name: `${item.name}`,
            value: [
               ...item.level
                  ? [ `> - Level required: \`Level ${item.level}\`` ]
                  : [],
               ...item.role
                  ? [ `> - Role given: ${Discord.roleMention(item.role)}` ]
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
                     .setDescription(`🏪 bunny's shop`)
                     .setDefault(true),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🛍️`)
                     .setLabel(`Flea market`)
                     .setValue(`flea-market`)
                     .setDescription(`🐉 dragon deals`),
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
               .setCustomId(`currency-buy-special-item`)
               .setPlaceholder(`Select an item to buy...`)
               .setOptions(
                  specialItems.length
                     ? specialItems
                        .map(item =>
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(item.name)
                              .setDescription(`🪙 ${item.price.toLocaleString()} coins`)
                              .setValue(item.name)
                              .setDefault(item.name === itemName)
                        )
                     : new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`fox`)
                        .setValue(`fox`)
               )
               .setDisabled(!specialItems.length)
         ),

      ...item
         ? [
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.ButtonBuilder()
                     .setCustomId(`currency-buy-special-item:${item.name}`)
                     .setLabel(`Buy item`)
                     .setEmoji(`🛍️`)
                     .setStyle(Discord.ButtonStyle.Success)
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