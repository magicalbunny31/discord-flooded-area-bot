export const name = "currency-create-flea-market-listing";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES ];

import Discord from "discord.js";
import { colours, deferComponents, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, rawIndex ] = interaction.customId.split(`:`);

   const index = +rawIndex || 0;


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


   // this user's currency
   const userCurrencyDocRef  = firestore.collection(`currency`).doc(interaction.guild.id).collection(`users`).doc(interaction.user.id);
   const userCurrencyDocSnap = await userCurrencyDocRef.get();
   const userCurrencyDocData = userCurrencyDocSnap.data() || {};


   // items
   const userItems = userCurrencyDocData.items || [];

   let items = (
      await Promise.all(
         userItems
            .filter((value, index, self) => // remove duplicates from the items
               index === self.findIndex(t =>
                  t.ref
                     ? t.ref.isEqual(value.ref)
                     : t.name === value.name
               )
            )
            .map(data =>
               ({
                  [data.ref ? `ref` : `name`]: data.ref || data.name, // map them back into json, but naming the DocumentRef as `ref` or string as `name`
                  quantity: userItems                                          // find how many items were present in the original list
                     .filter(item => item.ref === data.ref || item.name === data.name)
                     .length
               })
            )
            .map(async data => {
               if (data.name) { // cool this item is a name, return it as it was (named items don't have a sellers)
                  return {
                     name:     data.name,
                     quantity: data.quantity
                  };

               } else { // this item has a DocumentRef
                  const itemDocSnap = await data.ref.get();     // fetch this user's personal item
                  const itemDocData = itemDocSnap.data() || {}; // get their personal item's data

                  if (!Object.values(itemDocData).length) // ok for some reason this user doesn't actually have a personal item
                     return null;

                  else
                     return { // return this item's name
                        name:     itemDocData.item.name,
                        quantity: data.quantity,
                        seller:   data.ref.id
                     };
               };
            })
      )
   )
      .filter(Boolean); // `null` is present if there was no personal item present, just filter those out of the list


   // split the let array into chunks of 25
   const size = 25;
   items = Array.from(
      new Array(Math.ceil(items.length / size)),
      (_element, i) => items.slice(i * size, i * size + size)
   );

   const itemsForThisIndex = items[index];


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(data.colour)
         .setTitle(`💸 List an item on the flea market`)
         .setDescription(strip`
            ### 📃 Select an item from the select menu below to list it on the flea market
            > - Use the buttons to view more items.
         `)
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`currency-create-flea-market-listing`)
               .setPlaceholder(`Select an item...`)
               .setOptions(
                  itemsForThisIndex
                     ? itemsForThisIndex.map(item =>
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(item.name)
                           .setValue(item.seller || item.name)
                     )
                     : new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`🦊`)
                        .setValue(`🦊`)
               )
               .setDisabled(!itemsForThisIndex)
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`currency-create-flea-market-listing:${index - 1}`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setEmoji(`⬅️`)
               .setDisabled(index - 1 < 0),
            new Discord.ButtonBuilder()
               .setCustomId(`currency-create-flea-market-listing:${index + 1}`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setEmoji(`➡️`)
               .setDisabled(index + 1 >= items.length)
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`currency-items:flea-market`)
               .setLabel(`Go back to your flea market listings`)
               .setStyle(Discord.ButtonStyle.Secondary)
               .setEmoji(`💸`)
         )
   ];


   // edit the interaction's original reply
   await interaction.editReply({
      embeds,
      components
   });
};