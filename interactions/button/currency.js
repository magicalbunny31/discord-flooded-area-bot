import Discord from "discord.js";
import { FieldValue } from "@google-cloud/firestore";

import { colours, emojis, noop, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, category, item ] = interaction.customId.split(`:`);


   // set the booped button's emoji into a deferred state
   const components = interaction.message.components;

   const actionRowIndex = components.flat().findIndex(({ components }) => components.find(component => component.customId === interaction.customId));
   const buttonIndex = components[actionRowIndex].components.findIndex(component => component.customId === interaction.customId);

   const boopedButtonEmoji = components[actionRowIndex].components[buttonIndex].emoji;

   Object.assign(components[actionRowIndex].components[buttonIndex].data, {
      emoji: Discord.parseEmoji(emojis.loading)
   });


   // "defer" the interaction

   // update the message if this is the same command user as the select menu booper (or if the message is ephemeral)
   if (interaction.user.id === interaction.message.interaction?.user.id || !interaction.message.interaction) {
      const disabledComponents = components.map(actionRow =>
         actionRow.components.map(component => !component.disabled)
      );

      for (const [ actionRowIndex, disabledComponentsActionRow ] of disabledComponents.entries())
         for (const [ componentIndex, disabledComponent ] of disabledComponentsActionRow.entries())
            if (disabledComponent)
               components[actionRowIndex].components[componentIndex].data.disabled = true;

      await interaction.update({
         components
      });

      for (const [ actionRowIndex, disabledComponentsActionRow ] of disabledComponents.entries())
         for (const [ componentIndex, disabledComponent ] of disabledComponentsActionRow.entries())
            if (disabledComponent)
               components[actionRowIndex].components[componentIndex].data.disabled = false;

   } else
      // this isn't the same person who used the command: create a new reply to the interaction
      await interaction.deferReply({
         ephemeral: true
      });


   // restore the "deferred" option's emoji
   Object.assign(components[actionRowIndex].components[buttonIndex].data, {
      emoji: boopedButtonEmoji
   });


   // get this user's currency stuffs in the database
   const { coins = 0, items = [] } = (await firestore.collection(`currency`).doc(interaction.user.id).get()).data() || {};


   // shop items
   // TODO might make them rotate one day, with enough items
   const shopItems = (await firestore.collection(`command`).doc(`currency`).get())
      .data()
      [`shop-items`]
      .sort((a, b) => a.name.localeCompare(b.name));


   // what each bit of the menu does
   switch (category) {


      // view all items in the shop
      case `back-to-shop`: {
         // embeds
         const embeds = [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setDescription(
                  shopItems
                     .map(item => strip`
                        ${item.emoji} \`${item.name}\`
                        > *${item.description}*
                     `)
                     .join(`\n\n`)
               )
               .setFooter({
                  text: `🪙 ${coins.toLocaleString()} ${coins === 1 ? `coin` : `coins`}`
               })
         ];

         // components
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`currency:shop`)
                     .setPlaceholder(`buy an item.. 🏪`)
                     .setOptions(
                        shopItems.map(item =>
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(item.name)
                              .setValue(item.name)
                              .setDescription(`🪙 ${item.price} ${item.price === 1 ? `coin` : `coins`}`)
                              .setEmoji(item.emoji)
                        )
                     )
               )
         );

         // edit the interaction's original reply
         return await interaction.editReply({
            embeds,
            components
         });
      };


      // buy an item
      case `buy-item`: {
         // flooded area community guild
         const guild = await interaction.client.guilds.fetch(process.env.GUILD_FLOODED_AREA);
         const member = await guild.members.fetch(interaction.user);


         // find the item to buy
         const itemToBuy = shopItems.find(i => i.name === item);

         const hasRoleAlready = member.roles.cache.has(itemToBuy?.role);
         const cannotAffordItem = itemToBuy?.price > coins;

         const cannotBuyItem = hasRoleAlready || cannotAffordItem;
         const addItemToDatabase = !(itemToBuy.role);


         // can't find the item to buy
         if (!itemToBuy)
            try {
               // delete the original interaction message
               return await interaction.deleteReply();

            } catch {
               // the original interaction message no longer exists or it was ephemeral, stop here
               return;

            } finally {
               // follow-up the interaction
               return await interaction.followUp({
                  content: strip`
                     you've found a *forbidden ${Discord.chatInputApplicationCommandMention(`currency`, interaction.client.application.id)} menu*! ${emojis.sweats}
                     ..in other words, that ${Discord.chatInputApplicationCommandMention(`currency`, interaction.client.application.id)} menu was outdated: you're not in trouble ${emojis.mhn}
                     use the command ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`currency`, interaction.client.application.id)} to get the latest currency menu~ ${emojis.happ}
                  `,
                  ephemeral: true
               });
            };


         // components
         components.splice(2, 3,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.ButtonBuilder()
                     .setCustomId(`currency:back-to-shop`)
                     .setLabel(`view all items`)
                     .setEmoji(`🔙`)
                     .setStyle(Discord.ButtonStyle.Primary),
                  new Discord.ButtonBuilder()
                     .setCustomId(`currency:buy-item:${itemToBuy.name}`)
                     .setLabel(`buy item`)
                     .setEmoji(`🛍️`)
                     .setStyle(Discord.ButtonStyle.Success)
                     .setDisabled(cannotBuyItem)
               )
         );


         // can't buy this item
         if (cannotBuyItem) {
            // embeds
            const embeds =  [
               new Discord.EmbedBuilder()
                  .setColor(colours.red)
                  .setDescription(
                     (() => {
                        switch (true) {
                           case hasRoleAlready:
                              return strip`
                                 ❌ **you already have ${Discord.roleMention(itemToBuy.role)}!**
                                 > buying this item gives you this role~
                              `;

                           case cannotAffordItem:
                              return strip`
                                 ❌ **can't afford \`${itemToBuy.name}\`!**
                                 > price: 👛 \`${itemToBuy.price}\`
                                 > ${interaction.user}'s balance: 🪙 \`${coins}\`
                              `;
                        };
                     })()
                  )
            ];

            // edit the interaction's original reply
            return await interaction.editReply({
               embeds,
               components
            });
         };


         // give this user the role they just bought
         if (itemToBuy.role)
            await member.roles.add(itemToBuy.role, `bought for 🪙 ${itemToBuy.price} ${itemToBuy.price === 1 ? `coin` : `coins`}`);


         // set these new values in the database
         items.push({
            emoji: itemToBuy.emoji,
            name: itemToBuy.name
         });

         const payload = {
            coins: FieldValue.increment(-itemToBuy.price),
            ...addItemToDatabase
               ? { items }
               : {}
         };

         try {
            await firestore.collection(`currency`).doc(interaction.user.id).update(payload);
         } catch {
            await firestore.collection(`currency`).doc(interaction.user.id).set(payload);
         };


         // embeds
         const embeds = [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setDescription(`🛍️ **bought \`${itemToBuy.name}\`!**`)
               .setFooter({
                  text: `🪙 you have ${(coins - itemToBuy.price).toLocaleString()} ${(coins - itemToBuy.price) === 1 ? `coin` : `coins`} left`
               })
         ];


         // components
         components.splice(2, 3,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.ButtonBuilder()
                     .setCustomId(`currency:back-to-shop`)
                     .setLabel(`view all items`)
                     .setEmoji(`🔙`)
                     .setStyle(Discord.ButtonStyle.Primary)
               )
         );


         // edit the interaction's original reply
         return await interaction.editReply({
            embeds,
            components
         });
      };


      // view all items in the sell an item menu
      case `back-to-sell-item`: {
         // user has no items to sell
         if (!items.length) {
            // remove any other components
            components.splice(1, 4);

            // edit the interaction's original reply
            return await interaction.editReply({
               embeds: [
                  new Discord.EmbedBuilder()
                     .setColor(colours.flooded_area)
                     .setDescription(strip`
                        🎒 **you need items to access this menu!**
                        > earn some coins and buy some items in the shop~
                     `)
                     .setFooter({
                        text: `🪙 ${coins.toLocaleString()} ${coins === 1 ? `coin` : `coins`}`
                     })
               ],
               components
            });
         };


         // embeds
         const embeds = [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setAuthor({
                  name: interaction.user.tag,
                  iconURL: (interaction.member || interaction.user).displayAvatarURL()
               })
               .setFields({
                  name: `🎒 your items`,
                  value: items
                     .filter((item, index, self) =>
                        index === self.findIndex(value => item.name === value.name)
                     )
                     .sort((a, b) => a.name.localeCompare(b.name))
                     .map(item => `\`${items.filter(i => i.name === item.name).length.toLocaleString()}\` ${item.emoji} ${item.name}`)
                     .join(`\n`),
                  inline: true
               })
               .setFooter({
                  text: strip`
                     💰 selling an item gives you 50% of its current price back
                     🏪 if this item isn't in the shop, you can't sell it
                  `
               })
         ];


         // components
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`currency:sell-item`)
                     .setPlaceholder(`sell an item.. 💰`)
                     .setOptions(
                        items
                           .filter((item, index, self) =>
                              index === self.findIndex(value => item.name === value.name)
                           )
                           .filter(item => shopItems.find(i => i.name === item.name))
                           .map(item =>
                              new Discord.StringSelectMenuOptionBuilder()
                                 .setLabel(item.name)
                                 .setValue(item.name)
                                 .setDescription(`💰 sells for ${Math.round(shopItems.find(i => i.name === item.name).price / 2)} ${Math.round(shopItems.find(i => i.name === item.name).price / 2) === 1 ? `coin` : `coins`}`)
                                 .setEmoji(item.emoji)
                           )
                     )
               )
         );


         // edit the interaction's original reply
         return await interaction.editReply({
            embeds,
            components
         });
      };


      // sell an item
      case `sell-item`: {
         // find the item to sell
         const itemToSell = shopItems.find(i => i.name === item);

         const noItemToSell = !items.find(i => i.name === item);


         // can't find the item to sell
         if (!itemToSell)
            try {
               // delete the original interaction message
               return await interaction.deleteReply();

            } catch {
               // the original interaction message no longer exists or it was ephemeral, stop here
               return;

            } finally {
               // follow-up the interaction
               return await interaction.followUp({
                  content: strip`
                     you've found a *forbidden ${Discord.chatInputApplicationCommandMention(`currency`, interaction.client.application.id)} menu*! ${emojis.sweats}
                     ..in other words, that ${Discord.chatInputApplicationCommandMention(`currency`, interaction.client.application.id)} menu was outdated: you're not in trouble ${emojis.mhn}
                     use the command ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`currency`, interaction.client.application.id)} to get the latest currency menu~ ${emojis.happ}
                  `,
                  ephemeral: true
               });
            };


         // components
         components.splice(2, 3,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.ButtonBuilder()
                     .setCustomId(`currency:back-to-sell-item`)
                     .setLabel(`view all items`)
                     .setEmoji(`🔙`)
                     .setStyle(Discord.ButtonStyle.Primary),
                  new Discord.ButtonBuilder()
                     .setCustomId(`currency:sell-item:${itemToSell.name}`)
                     .setLabel(`sell item`)
                     .setEmoji(`💰`)
                     .setStyle(Discord.ButtonStyle.Success)
                     .setDisabled(noItemToSell)
               )
         );


         // user no longer has this item to sell
         if (noItemToSell)
            return await interaction.editReply({
               embeds: [
                  new Discord.EmbedBuilder()
                     .setColor(colours.red)
                     .setDescription(strip`
                        ❌ **can't sell \`${itemToSell.name}\`!**
                        > you need at least \`1\` \`${itemToSell.name}\` to sell one of them~
                     `)
               ],
               components
            });


         // set these new values in the database
         items.splice(
            items.findIndex(i => i.name === item),
            1
         );

         const payload = {
            coins: FieldValue.increment(Math.round(itemToSell.price / 2)),
            items
         };

         try {
            await firestore.collection(`currency`).doc(interaction.user.id).update(payload);
         } catch {
            await firestore.collection(`currency`).doc(interaction.user.id).set(payload);
         };


         // embeds
         const embeds = [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setDescription(`🛍️ **sold \`${itemToSell.name}\`!**`)
               .setFooter({
                  text: `🪙 you now have ${(coins + Math.round(itemToSell.price / 2)).toLocaleString()} ${(coins + Math.round(itemToSell.price / 2)) === 1 ? `coin` : `coins`}`
               })
         ];


         // components
         components.splice(2, 3,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.ButtonBuilder()
                     .setCustomId(`currency:back-to-sell-item`)
                     .setLabel(`view all items`)
                     .setEmoji(`🔙`)
                     .setStyle(Discord.ButtonStyle.Primary)
               )
         );


         // edit the interaction's original reply
         return await interaction.editReply({
            embeds,
            components
         });
      };


      // view all items in the give an item menu
      case `back-to-give-item`: {
         // user has no items to sell
         if (!items.length) {
            // remove any other components
            components.splice(1, 4);

            // edit the interaction's original reply
            return await interaction.editReply({
               embeds: [
                  new Discord.EmbedBuilder()
                     .setColor(colours.flooded_area)
                     .setDescription(strip`
                        🎒 **you need items to access this menu!**
                        > earn some coins and buy some items in the shop~
                     `)
                     .setFooter({
                        text: `🪙 ${coins.toLocaleString()} ${coins === 1 ? `coin` : `coins`}`
                     })
               ],
               components
            });
         };


         // embeds
         const embeds = [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setAuthor({
                  name: interaction.user.tag,
                  iconURL: (interaction.member || interaction.user).displayAvatarURL()
               })
               .setFields({
                  name: `🎒 your items`,
                  value: items
                     .filter((item, index, self) =>
                        index === self.findIndex(value => item.name === value.name)
                     )
                     .sort((a, b) => a.name.localeCompare(b.name))
                     .map(item => `\`${items.filter(i => i.name === item.name).length.toLocaleString()}\` ${item.emoji} ${item.name}`)
                     .join(`\n`),
                  inline: true
               })
         ];


         // components
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`currency:give-item`)
                     .setPlaceholder(`select an item to give.. 📥`)
                     .setOptions(
                        items
                           .filter((item, index, self) =>
                              index === self.findIndex(value => item.name === value.name)
                           )
                           .map(item =>
                              new Discord.StringSelectMenuOptionBuilder()
                                 .setLabel(item.name)
                                 .setValue(item.name)
                                 .setEmoji(item.emoji)
                           )
                     )
               )
         );


         // edit the interaction's original reply
         return await interaction.editReply({
            embeds,
            components
         });
      };


      // give an item to a member
      case `give-item`: {
         // the item to give and who to give it to
         const itemToGive = components[1].components[0].options.find(option => option.default).label;
         const giveItemTo = item;

         const noItemToGive = !items.find(i => i.name === itemToGive);


         // components
         components.splice(3, 2,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.ButtonBuilder()
                     .setCustomId(`currency:back-to-give-item`)
                     .setLabel(`view all items`)
                     .setEmoji(`🔙`)
                     .setStyle(Discord.ButtonStyle.Primary),
                  new Discord.ButtonBuilder()
                     .setCustomId(`currency:give-item:${giveItemTo}`)
                     .setLabel(`give item`)
                     .setEmoji(`📥`)
                     .setStyle(Discord.ButtonStyle.Success)
                     .setDisabled(noItemToGive)
               )
         );


         // user no longer has this item to give
         if (noItemToGive)
            return await interaction.editReply({
               embeds: [
                  new Discord.EmbedBuilder()
                     .setColor(colours.red)
                     .setDescription(strip`
                        ❌ **can't give \`${itemToGive}\`!**
                        > you need at least \`1\` \`${itemToGive}\` to give one of them~
                     `)
               ],
               components
            });


         // add this item to the user receiving the item
         const { items: receivingUserItems = [] } = (await firestore.collection(`currency`).doc(giveItemTo).get()).data() || {};

         receivingUserItems.push(
            items.find(item => item.name === itemToGive)
         );

         const receivingPayload = { items: receivingUserItems };


         // remove this item from the user giving the item
         items.splice(
            items.findIndex(item => item.name === itemToGive),
            1
         );

         const givingPayload = { items };


         // update these values in the database
         try {
            await firestore.collection(`currency`).doc(interaction.user.id).update(givingPayload);
         } catch {
            await firestore.collection(`currency`).doc(interaction.user.id).set(givingPayload);
         };

         try {
            await firestore.collection(`currency`).doc(giveItemTo).update(receivingPayload);
         } catch {
            await firestore.collection(`currency`).doc(giveItemTo).set(receivingPayload);
         };


         // message the member about this
         try {
            const user = await interaction.client.users.fetch(giveItemTo);
            await user.send({
               content: strip`
                  ${emojis.bun_paw_wave} **${interaction.user} gave you 1 \`${itemToGive}\`!**
                  > you can view your items with ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`currency`, interaction.client.application.id)}~
               `
            });

         } catch {
            // uh uh uh uh uh uh that didn't work uhh
            noop;
         };


         // embeds
         const youHave = items
            .filter(item => item.name === itemToGive)
            .length
            || 0;

         const embeds = [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setDescription(`🛍️ **given \`${itemToGive}\` to ${Discord.userMention(giveItemTo)}!**`)
               .setFooter({
                  text: `🎒 you have ${youHave.toLocaleString()} of this item`
               })
         ];


         // components
         components.splice(3, 2,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.ButtonBuilder()
                     .setCustomId(`currency:back-to-give-item`)
                     .setLabel(`view all items`)
                     .setEmoji(`🔙`)
                     .setStyle(Discord.ButtonStyle.Primary)
               )
         );


         // edit the interaction's original reply
         return await interaction.editReply({
            embeds,
            components
         });
      };


   };
};