export const name = "qotd-edit";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import dayjs from "dayjs";
import { colours } from "@magicalbunny31/awesome-utility-stuff";

import cache from "../../data/cache.js";
import qotd from "../../data/qotd.js";

/**
 * @param {Discord.StringSelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu, id, type ] = interaction.customId.split(`:`);
   const [ value ] = interaction.values;


   // show modals based on the type
   switch (type) {


      case `reactions`: {
         // show modals based on the value
         switch (value) {


            default: {
               // cache
               const reactionChoices = (cache.get(`qotd:${id}`)?.reactionChoices || [])
                  .find(reactionChoice => reactionChoice.reactionName === value);

               // modal
               const modal = new Discord.ModalBuilder()
                  .setCustomId(`qotd-edit:${id}:reactions`)
                  .setTitle(`Add reaction choice`)
                  .setComponents(
                     new Discord.ActionRowBuilder()
                        .setComponents(
                           new Discord.TextInputBuilder()
                              .setCustomId(`emoji`)
                              .setLabel(`EMOJI`)
                              .setMaxLength(2)
                              .setPlaceholder(`Emoji for this reaction choice (custom emojis not allowed)`)
                              .setRequired(true)
                              .setStyle(Discord.TextInputStyle.Short)
                              .setValue(reactionChoices?.reactionEmoji || ``)
                        ),
                     new Discord.ActionRowBuilder()
                        .setComponents(
                           new Discord.TextInputBuilder()
                              .setCustomId(`name`)
                              .setLabel(`NAME`)
                              .setMaxLength(100)
                              .setPlaceholder(`Name of this reaction choice`)
                              .setRequired(true)
                              .setStyle(Discord.TextInputStyle.Short)
                              .setValue(reactionChoices?.reactionName || ``)
                        )
                  );

               // show modal
               await interaction.showModal(modal);

               // stop here
               break;
            };


            case `${id}:add`: {
               // modal
               const modal = new Discord.ModalBuilder()
                  .setCustomId(`qotd-edit:${id}:reactions`)
                  .setTitle(`Add reaction choice`)
                  .setComponents(
                     new Discord.ActionRowBuilder()
                        .setComponents(
                           new Discord.TextInputBuilder()
                              .setCustomId(`emoji`)
                              .setLabel(`EMOJI`)
                              .setMaxLength(2)
                              .setPlaceholder(`Emoji for this reaction choice (custom emojis not allowed)`)
                              .setRequired(true)
                              .setStyle(Discord.TextInputStyle.Short)
                        ),
                     new Discord.ActionRowBuilder()
                        .setComponents(
                           new Discord.TextInputBuilder()
                              .setCustomId(`name`)
                              .setLabel(`NAME`)
                              .setMaxLength(100)
                              .setPlaceholder(`Name of this reaction choice`)
                              .setRequired(true)
                              .setStyle(Discord.TextInputStyle.Short)
                        )
                  );

               // show modal
               await interaction.showModal(modal);

               // stop here
               break;
            };


            case `${id}:remove`: {
               // cache
               const reactionChoices = cache.get(`qotd:${id}`)?.reactionChoices || [];

               // embeds
               const embeds = [
                  ...interaction.message.embeds,
                  new Discord.EmbedBuilder()
                     .setColor(colours.red)
                     .setDescription(`### 💣 Select reaction choices to remove...`)
               ];

               // components
               const components = [
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.StringSelectMenuBuilder()
                           .setCustomId(`qotd-edit:${id}:reactions-remove`)
                           .setPlaceholder(`Reaction choices`)
                           .setOptions(
                              reactionChoices.map(reactionChoice =>
                                 new Discord.StringSelectMenuOptionBuilder()
                                    .setLabel(reactionChoice.reactionName)
                                    .setValue(reactionChoice.reactionName)
                                    .setEmoji(reactionChoice.reactionEmoji)
                              )
                           )
                           .setMinValues(1)
                           .setMaxValues(reactionChoices.length)
                     ),
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.ButtonBuilder()
                           .setCustomId(`qotd-edit:${id}`)
                           .setLabel(`Go back`)
                           .setEmoji(`🔙`)
                           .setStyle(Discord.ButtonStyle.Primary)
                     )
               ];

               // update the interaction's original reply
               await interaction.update({
                  embeds,
                  components
               });

               // stop here
               break;
            };


         };

         // stop here
         break;
      };


      case `reactions-remove`: {
         // cache
         const reactionChoices = cache.get(`qotd:${id}`)?.reactionChoices || [];

         // remove reaction choices
         for (const value of interaction.values)
            if (reactionChoices.find(reactionChoice => reactionChoice.reactionName === value))
               reactionChoices.splice(reactionChoices.findIndex(reactionChoice => reactionChoice.reactionName === value), 1);

         // set the data back into the cache
         cache.set(`qotd:${id}`, {
            ...(cache.get(`qotd:${id}`) || {}),
            reactionChoices
         }, dayjs.duration(1, `day`).asSeconds());

         // respond to the interaction
         await qotd(interaction, id);

         // stop here
         break;
      };


   };
};