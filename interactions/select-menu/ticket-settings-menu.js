export const name = "ticket-settings-menu";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.StringSelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu ] = interaction.customId.split(`:`);
   const [ setting ] = interaction.values;


   // set the selected value as default
   const components = interaction.message.components;

   for (const option of components[0].components[0].options)
      option.default = false;

   const selectedOption = components[0].components[0].options.find(option => option.value === setting);
   selectedOption.default = true;


   // "defer" the interaction
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


   // mentions
   const defaultMentions = [
      `false-votekicking`,    `griefing`, `spamming`,
      `bypassing`,            `toxicity`, `bug-abuse`,
      `inappropriate-player`, `bigotry`,  `exploiting`,
      `ban-evade`,            `other`
   ];


   // current ticket settings
   const {
      mentions                  = defaultMentions,
      members                   = [],
      "ban-appeals": banAppeals = true
   } = (await firestore.collection(`tickets`).doc(interaction.guild.id).get()).data().moderators[interaction.user.id] || {};



   // reason descriptions
   const descriptions = {
      "mentions": {
         emoji: `📢`,
         name: `Mentions`,
         description: strip`
            > Don't like being @mentioned for a specific ticket reason? 
            > You can remove yourself from them here!
         `,
         components: [
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`mentions`)
                     .setPlaceholder(`🏷️ Select mention reasons to be notified for...`)
                     .setOptions(
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`🥾`)
                           .setLabel(`False votekicking`)
                           .setValue(`false-votekicking`)
                           .setDefault(mentions.includes(`false-votekicking`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`💣`)
                           .setLabel(`Griefing`)
                           .setValue(`griefing`)
                           .setDefault(mentions.includes(`griefing`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`💬`)
                           .setLabel(`Spamming`)
                           .setValue(`spamming`)
                           .setDefault(mentions.includes(`spamming`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`💭`)
                           .setLabel(`Bypassing / Swearing`)
                           .setValue(`bypassing`)
                           .setDefault(mentions.includes(`bypassing`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`🗯️`)
                           .setLabel(`Toxicity / Harassment`)
                           .setValue(`toxicity`)
                           .setDefault(mentions.includes(`toxicity`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`🐛`)
                           .setLabel(`Bug abusing`)
                           .setValue(`bug-abuse`)
                           .setDefault(mentions.includes(`bug-abuse`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`🪪`)
                           .setLabel(`Inappropriate player`)
                           .setValue(`inappropriate-player`)
                           .setDefault(mentions.includes(`inappropriate-player`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`💢`)
                           .setLabel(`Bigotry`)
                           .setValue(`bigotry`)
                           .setDefault(mentions.includes(`bigotry`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`💻`)
                           .setLabel(`Exploiting / Hacking`)
                           .setValue(`exploiting`)
                           .setDefault(mentions.includes(`exploiting`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`👥`)
                           .setLabel(`Ban evading`)
                           .setValue(`ban-evade`)
                           .setDefault(mentions.includes(`ban-evade`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`❓`)
                           .setLabel(`Other...`)
                           .setValue(`other`)
                           .setDefault(mentions.includes(`other`))
                     )
                     .setMinValues(0)
                     .setMaxValues(11)
               )
         ]
      },

      "members": {
         emoji: `🔕`,
         name: `Muted members`,
         description: strip`
            > Don't like being @mentioned for tickets created by specific members? 
            > You can add them to your blacklist here!
            > You can mute up to 25 members.
         `,
         components: [
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.UserSelectMenuBuilder()
                     .setCustomId(`members:add`)
                     .setPlaceholder(`🔕 Select members to mute...`)
                     .setMinValues(1)
                     .setMaxValues(25 - (members.length || 0))
                     .setDisabled(members.length === 25)
               ),
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`members:remove`)
                     .setPlaceholder(`🔔 Select members to unmute...`)
                     .setOptions(
                        members.length
                           ? await Promise.all(
                              members
                                 .map(async userId => {
                                    const user = await interaction.client.users.fetch(userId);
                                    const member = await interaction.guild.members.fetch(user);
                                    return new Discord.StringSelectMenuOptionBuilder()
                                       .setLabel(`${member.displayName}`)
                                       .setDescription(`@${user.tag} (${userId})`)
                                       .setValue(userId);
                                 })
                           )
                           : new Discord.StringSelectMenuOptionBuilder() // fallback option if no options are present
                           .setLabel(`🦊`)
                           .setValue(`🦊`)
                     )
                     .setMinValues(1)
                     .setMaxValues(members.length || 1)
                     .setDisabled(!members.length)
               )
         ]
      },

      "ban-appeals": {
         emoji: `🔨`,
         name: `Ban Appeals`,
         description: strip`
            > Don't like being @mentioned for ban appeals? 
            > You can remove yourself from them here!
         `,
         components: [
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`ticket-settings-ban-appeals`)
                     .setPlaceholder(`🔔 Select an option...`)
                     .setOptions(
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`✅`)
                           .setLabel(`Notifications enabled`)
                           .setValue(`true`)
                           .setDefault(banAppeals),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setEmoji(`❌`)
                           .setLabel(`Notifications disabled`)
                           .setValue(`false`)
                           .setDefault(!banAppeals)
                     )
               )
         ]
      }
   };


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setTitle(`🔧 Ticket Settings`)
         .setDescription(strip`
            ${descriptions[setting].emoji} **${descriptions[setting].name}**
            ${descriptions[setting].description}
         `)
         .setFooter({
            text: `this needs redoing soon ~bunny` // TODO
         })
   ];


   // components
   components.splice(1, 4,
      ...descriptions[setting].components
   );


   // update the interaction
   return await interaction.editReply({
      embeds,
      components
   });
};