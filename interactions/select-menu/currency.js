import Discord from "discord.js";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.AnySelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu, category ] = interaction.customId.split(`:`);
   const [ value ] = interaction.values || [ ...interaction.users.values() ];


   // set the selected value(s) as default in its select menu
   const components = interaction.message.components;

   let selectMenuIndex, selectedValuesIndexes, selectedValueEmoji;

   if (interaction.isStringSelectMenu()) {
      selectMenuIndex = components.flat().findIndex(({ components }) => components[0].customId === interaction.customId);
      selectedValuesIndexes = components[selectMenuIndex].components[0].options.findIndex(option => option.value === value);

      selectedValueEmoji = components[selectMenuIndex].components[0].options[selectedValuesIndexes].emoji;

      for (const option of components[selectMenuIndex].components[0].options)
         option.default = false;

      Object.assign(components[selectMenuIndex].components[0].options[selectedValuesIndexes], {
         emoji: Discord.parseEmoji(emojis.loading),
         default: true
      });
   };


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
   if (interaction.isStringSelectMenu())
      Object.assign(components[selectMenuIndex].components[0].options[selectedValuesIndexes], {
         emoji: selectedValueEmoji
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


      case `menu`:
         switch (value) {


            // coin balance and items
            case `balance`: {
               // embeds
               const embeds = [
                  new Discord.EmbedBuilder()
                     .setColor(colours.flooded_area)
                     .setAuthor({
                        name: interaction.user.tag,
                        iconURL: (interaction.member || interaction.user).displayAvatarURL()
                     })
                     .setFields({
                        name: `👛 coin balance`,
                        value: `\`${coins.toLocaleString()}\` ${coins === 1 ? `coin` : `coins`}`,
                        inline: true
                     }, {
                        name: `🎒 your items`,
                        value: items
                           .filter((item, index, self) =>
                              index === self.findIndex(value => item.name === value.name)
                           )
                           .sort((a, b) => a.name.localeCompare(b.name))
                           .map(item => `\`${items.filter(i => i.name === item.name).length.toLocaleString()}\` ${item.emoji} ${item.name}`)
                           .join(`\n`)
                           || `**\`no items..\`** ${emojis.rip}`,
                        inline: true
                     })
                     .setFooter({
                        text: `🪙 you earn 1 coin per message every minute!`
                     })
               ];

               // remove all components that aren't the menu
               components.splice(1, 4);

               // edit the interaction's original reply
               return await interaction.editReply({
                  embeds,
                  components
               });
            };


            // the shop
            case `shop`: {
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


            // sell an item
            case `sell-item`: {
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


               // user doesn't have any items to sell
               if (!items.filter(item => shopItems.find(i => i.name === item.name)).length) {
                  // remove any other components
                  components.splice(1, 4);

                  // edit the interaction's original reply
                  return await interaction.editReply({
                     embeds: [
                        new Discord.EmbedBuilder()
                           .setColor(colours.flooded_area)
                           .setDescription(strip`
                              ❌ **you don't have any items to sell!**
                              > you can only sell items that are in the shop: looks like you don't have any of those~
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
                           🏪 if your item isn't in the shop, you can't sell it
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


            // give an item to another member
            case `give-item`: {
               // user has no items to give
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
         };


      // prompt to buy item
      case `shop`: {
         // find the item to buy
         const itemToBuy = shopItems.find(item => item.name === value);

         const hasRoleAlready = (await (await interaction.client.guilds.fetch(process.env.GUILD_FLOODED_AREA)).members.fetch(interaction.user)).roles.cache.has(itemToBuy?.role);
         const cannotAffordItem = itemToBuy?.price > coins;

         const cannotBuyItem = hasRoleAlready || cannotAffordItem;


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


         // embeds
         const embeds = [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setDescription(
                  [
                     `🛒 **buy \`${itemToBuy.name}\` for \\🪙 \`${itemToBuy.price}\` ${itemToBuy.price === 1 ? `coin` : `coins`}?**`,
                     `> *${itemToBuy.description}*`,

                     ...itemToBuy.role
                        ? [ `> gives you the role ${Discord.roleMention(itemToBuy.role)} in Flooded Area Community` ]
                        : []
                  ]
                     .join(`\n`)
               )
               .setFooter({
                  text: `🪙 you have ${coins.toLocaleString()} ${coins === 1 ? `coin` : `coins`}`
               })
         ];


         // edit the interaction's original reply
         return await interaction.editReply({
            embeds,
            components
         });
      };


      // prompt to sell an item
      case `sell-item`: {
         // find the item to sell
         const itemToSell = shopItems.find(item => item.name === value);

         const noItemToSell = !items.find(item => item.name === value);


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


         // embeds
         const embeds = [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setDescription(strip`
                  🛒 **sell \`1\` \`${itemToSell.name}\` for \\🪙 \`${Math.round(shopItems.find(item => item.name === itemToSell.name).price / 2)}\` ${Math.round(shopItems.find(item => item.name === itemToSell.name).price / 2) === 1 ? `coin` : `coins`}?**
                  > *${itemToSell.description}*
               `)
               .setFooter({
                  text: `🪙 you have ${coins.toLocaleString()} ${coins === 1 ? `coin` : `coins`}`
               })
         ];


         // edit the interaction's original reply
         return await interaction.editReply({
            embeds,
            components
         });
      };


      // prompt to choose who to give an item to
      case `give-item`: {
         // can't find the item to give
         const noItemToGive = !items.find(item => item.name === value);


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
         components.splice(2, 3,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.UserSelectMenuBuilder()
                     .setCustomId(`currency:give-item-to`)
                     .setPlaceholder(`who are you giving this item to? 👤`)
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
                        ❌ **can't give \`${value}\`!**
                        > you need at least \`1\` \`${value}\` to give one of them~
                     `)
               ],
               components
            });


         // edit the interaction's original reply
         return await interaction.editReply({
            embeds,
            components
         });
      };


      // prompt to give an item to another member
      case `give-item-to`: {
         // the item to give
         const itemToGive = components[1].components[0].options.find(option => option.default).label;

         const noItemToGive = !items.find(item => item.name === itemToGive);

         const member = await interaction.guild.members.fetch(value);


         // user no longer has this item to give
         if (noItemToGive) {
            // components
            components.splice(2, 3,
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.UserSelectMenuBuilder()
                        .setCustomId(`currency:give-item-to`)
                        .setPlaceholder(`who are you giving this item to? 👤`)
                        .setDisabled(true)
                  )
            );

            // edit the interaction's original reply
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
         };


         // can't give item to themselves
         if (member.id === interaction.user.id)
            return await interaction.editReply({
               embeds: [
                  new Discord.EmbedBuilder()
                     .setColor(colours.red)
                     .setDescription(strip`
                        ❌ **can't give \`${itemToGive}\` to yourself!**
                        > be nice and choose someone that isn't yourself~
                     `)
               ],
               components
            });


         // can't give items to bots
         if (member.user.bot)
            return await interaction.editReply({
               embeds: [
                  new Discord.EmbedBuilder()
                     .setColor(colours.red)
                     .setDescription(strip`
                        ❌ **can't give items to bots!**
                        > how about choosing someone who isn't a bot?
                     `)
               ],
               components
            });


         // embeds
         const youHave = items
            .filter(item => item.name === itemToGive)
            .length
            || 0;

         const theyHave = (await firestore.collection(`currency`).doc(member.id).get())
            .data()
            ?.items
            ?.filter(item => item.name === itemToGive)
            ?.length
            || 0;

         const embeds = [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setDescription(strip`
                  📥 **give \`1\` \`${itemToGive}\` to ${member}?**
                  > ${member} has \`${theyHave}\` ${theyHave === 1 ? `\`${itemToGive}\`` : `\`${itemToGive}\`s`}
               `)
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
                     .setStyle(Discord.ButtonStyle.Primary),
                  new Discord.ButtonBuilder()
                     .setCustomId(`currency:give-item:${member.id}`)
                     .setLabel(`give item`)
                     .setEmoji(`📥`)
                     .setStyle(Discord.ButtonStyle.Success)
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