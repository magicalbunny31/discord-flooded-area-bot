export const name = "currency balance";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];


import Discord from "discord.js";
import dayjs from "dayjs";
import { colours, strip, sum } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const user = interaction.options.getUser(`user`)
      || interaction.user;


   // data to show
   const data = {
      [process.env.GUILD_FLOODED_AREA]: {
         colour: colours.flooded_area
      },

      [process.env.GUILD_SPACED_OUT]: {
         colour: colours.spaced_out
      }
   }[interaction.guild.id];


   // this is a bot
   if (user.bot)
      return await interaction.reply({
         content: `### ❌ Bots aren't part of the currency system.`,
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply();


   // database
   const userCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(user.id);
   const userCurrencyDocSnap = await userCurrencyDocRef.get();
   const userCurrencyDocData = userCurrencyDocSnap.data() || {};

   const userCoins      = userCurrencyDocData.coins                 || 0;
   const userTotalCoins = userCurrencyDocData[`total-coins-earned`] || 0;

   const userItem      = userCurrencyDocData.item || {};
   const userItemPrice = userItem.price           || 0;

   const userItems = userCurrencyDocData.items || [];
   const userItemsValue = sum(
      userItems.map(item => item[`bought-for`]),
      0
   );

   const userCarrots            = userCurrencyDocData.carrots || {};
   const previousCarrotsExpired = userCarrots[`expires-at`]?.seconds < dayjs().unix(); // expired carrot values are calculated as item values
   const userCarrotsValue = previousCarrotsExpired
      ? 0
      : (userCarrots.quantity || 0) * (userCarrots.price || 0);

   const user24HourIncome = userCurrencyDocData[`24-hour-stats`]?.income || [];
   const userIncome = sum(
      user24HourIncome
         .filter(data => dayjs.unix(data.at.seconds).add(1, `day`).unix() > dayjs().unix())
         .map(data => data.coins),
      0
   );

   const user24HourExpenditure = userCurrencyDocData[`24-hour-stats`]?.expenditure || [];
   const userExpenditure = sum(
      user24HourExpenditure
         .filter(data => dayjs.unix(data.at.seconds).add(1, `day`).unix() > dayjs().unix())
         .map(data => data.coins),
      0
   );


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(user.accentColor || (await user.fetch(true)).accentColor || data.colour)
         .setAuthor({
            name: `@${user.username}`,
            iconURL: user.displayAvatarURL()
         })
         .setTitle(`🏦 Bank`)
         .setFields({
            name: `🪙 Current balance`,
            value: `> \`${userCoins.toLocaleString()}\` ${userCoins === 1 ? `coin` : `coins`}`,
            inline: true
         }, {
            name: `💰 Net worth`,
            value: `> \`${(userCoins + userItemPrice + userItemsValue + userCarrotsValue).toLocaleString()}\` ${(userCoins + userItemPrice + userItemsValue + userCarrotsValue) === 1 ? `coin` : `coins`}`,
            inline: true
         }, {
            name: `👛 Coins earned from talking`,
            value: `> \`${userTotalCoins.toLocaleString()}\` ${userTotalCoins === 1 ? `coin` : `coins`}`,
            inline: true
         }, {
            name: `📈 Income (past 24 hours)`,
            value: `> \`${userIncome.toLocaleString()}\` ${userIncome === 1 ? `coin` : `coins`}`,
            inline: true
         }, {
            name: `📉 Expenditure (past 24 hours)`,
            value: `> \`${userExpenditure.toLocaleString()}\` ${userExpenditure === 1 ? `coin` : `coins`}`,
            inline: true
         })
         .setFooter({
            text: strip`
               🪙 You earn 1 coin for every message you send in this server, per minute.
               📈 During the weekend, you'll earn 2 coins for every message!
            `
         })
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds
   });
};