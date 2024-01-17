export const name = "qotd-edit";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import dayjs from "dayjs";

import cache from "../../data/cache.js";
import qotd from "../../data/qotd.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, id, type ] = interaction.customId.split(`:`);


   // show modals based on the type
   switch (type) {


      default: {
         // respond to the interaction
         await qotd(interaction, id);

         // stop here
         break;
      };


      case `content`: {
         // values
         const { description = ``, imageUrl = `` } = cache.get(`qotd:${id}`) || {};

         // modal
         const modal = new Discord.ModalBuilder()
            .setCustomId(`qotd-edit:${id}:content`)
            .setTitle(`Edit QoTD content`)
            .setComponents(
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.TextInputBuilder()
                        .setCustomId(`description`)
                        .setLabel(`QUESTION`)
                        .setPlaceholder(`What is your question for this QoTD?`)
                        .setRequired(true)
                        .setStyle(Discord.TextInputStyle.Paragraph)
                        .setValue(description)
                  ),
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.TextInputBuilder()
                        .setCustomId(`image`)
                        .setLabel(`IMAGE URL`)
                        .setPlaceholder(`Image url to display with this QoTD`)
                        .setRequired(false)
                        .setStyle(Discord.TextInputStyle.Short)
                        .setValue(imageUrl)
                  )
            );

         // show modal
         await interaction.showModal(modal);

         // stop here
         break;
      };


      case `thread`: {
         // values
         const { threadName = `` } = cache.get(`qotd:${id}`) || {};

         // modal
         const modal = new Discord.ModalBuilder()
            .setCustomId(`qotd-edit:${id}:thread`)
            .setTitle(`Edit discussion thread`)
            .setComponents(
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.TextInputBuilder()
                        .setCustomId(`name`)
                        .setLabel(`NAME`)
                        .setMaxLength(100)
                        .setPlaceholder(`Name of this discussion thread`)
                        .setRequired(true)
                        .setStyle(Discord.TextInputStyle.Short)
                        .setValue(threadName)
                  )
            );

         // show modal
         await interaction.showModal(modal);

         // stop here
         break;
      };


      case `thread-remove`: {
         // cache
         const data = cache.get(`qotd:${id}`) || {};
         delete data.threadName;
         cache.set(`qotd:${id}`, data, dayjs.duration(1, `day`).asSeconds());

         // components
         const components = interaction.message.components;
         Object.assign(components[2].components[0].data, {
            label: `Add discussion thread`,
            emoji: Discord.parseEmoji(`➕`)
         });
         components[2].components.pop();

         // update the interaction's reply
         await interaction.update({
            components
         });

         // stop here
         break;
      };


   };
};