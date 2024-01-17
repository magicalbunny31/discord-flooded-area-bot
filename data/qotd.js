import Discord from "discord.js";
import { colours, choice } from "@magicalbunny31/awesome-utility-stuff";

import cache from "./cache.js";

/**
 * @param {Discord.ButtonInteraction | Discord.StringSelectMenuInteraction | Discord.ModalSubmitInteraction} interaction
 */
export default async (interaction, id) => {
   // cache
   const data = cache.get(`qotd:${id}`);


   // embeds
   const embedColour = interaction.user.accentColor || (await interaction.user.fetch(true)).accentColor || choice([ colours.red, colours.orange, colours.yellow, colours.green, colours.blue, colours.purple, colours.pink ]);

   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(embedColour)
         .setAuthor({
            name: `${interaction.user.displayName === interaction.user.username ? `@${interaction.user.username}` : `${interaction.user.displayName} (@${interaction.user.username})`} asks...`,
            iconURL: interaction.user.displayAvatarURL()
         })
         .setFooter({
            text: [
               ...(data.description && (data.threadName || data.reactionChoices))
                  ? []
                  : [ `📝 You need to have [question] and at least one of [discussion thread, reaction choices] to submit this QoTD` ],
               `📥 Once submitted, you won't be able to edit this QoTD again`,
               `🚨 Staff will review your submitted QoTD before it gets posted`
            ]
               .join(`\n`)
         })
   ];

   if (data.description)
      embeds[0].setDescription(data.description);

   if (data.imageUrl)
      embeds[0].setImage(data.imageUrl);

   if (data.reactionChoices?.length)
      embeds[0].setFields({
         name: `\u200b`,
         value: data.reactionChoices
            .map(reactionChoice => `> ${reactionChoice.reactionEmoji} ${reactionChoice.reactionName}`)
            .join(`\n`)
      });


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`qotd-create:${id}`)
               .setLabel(`Submit QoTD`)
               .setEmoji(`✅`)
               .setStyle(Discord.ButtonStyle.Success)
               .setDisabled(!(data.description && (data.threadName || data.reactionChoices)))
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`qotd-edit:${id}:content`)
               .setLabel(`${data.description ? `Edit` : `Add`} question`)
               .setEmoji(data.description ? `📝` : `➕`)
               .setStyle(Discord.ButtonStyle.Primary)
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`qotd-edit:${id}:thread`)
               .setLabel(`${data.threadName ? `Edit` : `Add`} discussion thread`)
               .setEmoji(data.threadName ? `📝` : `➕`)
               .setStyle(Discord.ButtonStyle.Primary),
            ...data.threadName
               ? [
                  new Discord.ButtonBuilder()
                     .setCustomId(`qotd-edit:${id}:thread-remove`)
                     .setLabel(`Remove discussion thread`)
                     .setEmoji(`💣`)
                     .setStyle(Discord.ButtonStyle.Danger)
               ]
               : []
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`qotd-edit:${id}:reactions`)
               .setPlaceholder(`Reaction choices`)
               .setOptions(
                  ...(data.reactionChoices || []).map(reactionChoice =>
                     new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(reactionChoice.reactionName)
                        .setValue(reactionChoice.reactionName)
                        .setEmoji(reactionChoice.reactionEmoji)
                  ),
                  ...(data.reactionChoices?.length || 0) < 10
                     ? [
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Add reaction choice`)
                           .setValue(`${id}:add`)
                           .setEmoji(`➕`)
                     ]
                     : [],
                  ...data.reactionChoices?.length
                     ? [
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Remove reaction choices`)
                           .setValue(`${id}:remove`)
                           .setEmoji(`💣`)
                     ]
                     : []
               )
         )
   ];


   // update the interaction's original reply
   await interaction.update({
      embeds,
      components
   });
};