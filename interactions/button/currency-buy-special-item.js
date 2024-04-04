export const name = "currency-buy-special-item";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES ];

import Discord from "discord.js";
import dayjs from "dayjs";
import { FieldValue, Timestamp } from "@google-cloud/firestore";
import { colours, emojis, deferComponents, strip } from "@magicalbunny31/awesome-utility-stuff";

import shopResponses from "../../data/shop-responses.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, itemName ] = interaction.customId.split(`:`);


   // function to get a level from experience
   const getLevel = experience => Math.floor(Math.sqrt(experience / 10));


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
   // update the message if this is a command reply and this is the same command user as the button booper (or if the message is ephemeral)
   const isSameCommandUser = interaction.user.id === interaction.message.interaction?.user.id;
   const isEphemeral = interaction.message.flags.has(Discord.MessageFlags.Ephemeral);

   if (isSameCommandUser || isEphemeral)
      await interaction.update({
         components: deferComponents(interaction.customId, interaction.message.components)
      });

   else // this isn't the same person who used the command: create a new reply to the interaction
      await interaction.deferReply({
         ephemeral: true
      });


   // shop items
   const shopDocRef  = firestore.collection(`currency`).doc(interaction.guild.id);
   const shopDocSnap = await shopDocRef.get();
   const shopDocData = shopDocSnap.data() || {};

   const specialItems = shopDocData[`special-items`] || [];


   // this user's currency
   const userCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(interaction.user.id);
   const userCurrencyDocSnap = await userCurrencyDocRef.get();
   const userCurrencyDocData = userCurrencyDocSnap.data() || {};

   const userItems = userCurrencyDocData.items || [];


   // this item's information
   const item = specialItems.find(item => item.name === itemName);


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
      new Discord.EmbedBuilder()
         .setColor(data.colour)
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`currency-shop:special-items`)
               .setLabel(`Go back to bunny's shop`)
               .setEmoji(`🏪`)
               .setStyle(Discord.ButtonStyle.Secondary)
         )
   ];


   // this item doesn't exist
   if (!item) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't buy item
            > - This item no longer exists.
            > - It may have been removed before you could've bought it.
         `)
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         });

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // the user doesn't have the required level to buy this item
   const userLevelsDocRef  = firestore.collection(`levels`).doc(interaction.guild.id).collection(`users`).doc(interaction.user.id);
   const userLevelsDocSnap = await userLevelsDocRef.get();
   const userLevelsDocData = userLevelsDocSnap.data() || {};

   const experience = userLevelsDocData.experience || 0;
   const level      = getLevel(experience);

   if (item.level && level < item.level) {
      const commands = await interaction.guild.commands.fetch();
      const commandLevelId = commands.find(command => command.name === `level`)?.id || 0;

      embeds[0]
         .setDescription(strip`
            ### ❌ Can't buy item
            > - You need to be \`Level ${item.level}\` to buy this item.
            >  - View your level with ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`level`, commandLevelId)}.
         `)
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         });

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // this is a role, this member already has this role
   if (item.role && interaction.member.roles.cache.has(item.role)) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't buy item
            > - This item gives you the ${Discord.roleMention(item.role)} role: you already have this role.
         `)
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         });

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // the price to pay
   const priceToPay = item.price;

   const taxRate    = shopDocSnap.data()[`tax-rate`];
   const taxedCoins = Math.ceil (priceToPay * taxRate);


   // the user doesn't have enough coins to buy this item
   const userCoins = userCurrencyDocData.coins || 0;

   if (priceToPay > userCoins) {
      embeds[0]
         .setDescription(strip`
            ### ❌ Can't buy item
            > - You need 🪙 \`${priceToPay.toLocaleString()}\` ${priceToPay === 1 ? `coin` : `coins`} to buy this item.
         `)
         .setFooter({
            text: `🪙 ${(userCurrencyDocData.coins || 0).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
         });

      return await interaction.editReply({
         embeds,
         components
      });
   };


   // this is a role, give the member this role
   if (item.role)
      await interaction.member.roles.add(item.role);


   // update this user's items
   else {
      userItems.push({
         "bought-for": item.price,
         name:         item.name
      });
   };


   // update this user's currency
   const userExpenditure = {
      coins: priceToPay,
      at: new Timestamp(dayjs().unix(), 0)
   };

   await userCurrencyDocRef.update({
      "24-hour-stats.expenditure": FieldValue.arrayUnion(userExpenditure),
      coins:                       FieldValue.increment(-priceToPay),
      items:                       userItems
   });


   // update the tax-to-user's currency
   const taxToUser = shopDocSnap.data()[`tax-to-user`];
   const taxToUserCurrencyDocRef = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(taxToUser);

   const taxToUserIncome = {
      coins: taxedCoins,
      at: new Timestamp(dayjs().unix(), 0)
   };

   await taxToUserCurrencyDocRef.update({
      "24-hour-stats.income": FieldValue.arrayUnion(taxToUserIncome),
      coins:                  FieldValue.increment(taxedCoins)
   });


   // embeds
   embeds[0]
      .setColor(bunnyShopShopkeeper.colour)
      .setDescription(strip`
         ### 🛍️ ${item.name} bought!
         >>> ${bunnyShopShopkeeper.purchase}
      `)
      .setFooter({
         text: `🪙 ${(userCoins - priceToPay).toLocaleString()} ${userCurrencyDocData.coins === 1 ? `coin` : `coins`}`
      });


   // edit the interaction
   await interaction.editReply({
      embeds,
      components
   });
};