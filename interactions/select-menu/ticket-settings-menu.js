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
      `false-votekicking`, `harassed-people`,      `threatened-people`,
      `hate-speech`,       `violence`,             `swore-in-chat`,
      `sexual-in-chat`,    `inappropriate-avatar`, `exploiting`,
      `bug-abuse`,         `sexual-build`,         `being-sexual`,
      `ban-evasion`,       `moderator-abuse`,      `other`
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
                           .setLabel(`Started an invalid votekick`)
                           .setEmoji(`🥾`)
                           .setValue(`false-votekicking`)
                           .setDefault(mentions.includes(`false-votekicking`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Verbally harassed me or someone else`)
                           .setEmoji(`💢`)
                           .setValue(`harassed-people`)
                           .setDefault(mentions.includes(`harassed-people`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Threatened violence or real world harm`)
                           .setEmoji(`💢`)
                           .setValue(`threatened-people`)
                           .setDefault(mentions.includes(`threatened-people`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Promoted hate based on identity or vulnerability`)
                           .setEmoji(`💢`)
                           .setValue(`hate-speech`)
                           .setDefault(mentions.includes(`hate-speech`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Celebrated or glorified acts of violence`)
                           .setEmoji(`💢`)
                           .setValue(`violence`)
                           .setDefault(mentions.includes(`violence`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Used offensive language`)
                           .setEmoji(`🗯️`)
                           .setValue(`swore-in-chat`)
                           .setDefault(mentions.includes(`swore-in-chat`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Said something explicit or sexual`)
                           .setEmoji(`🗯️`)
                           .setValue(`sexual-in-chat`)
                           .setDefault(mentions.includes(`sexual-in-chat`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Inappropriate avatar`)
                           .setEmoji(`🔞`)
                           .setValue(`inappropriate-avatar`)
                           .setDefault(mentions.includes(`inappropriate-avatar`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Using exploits, cheats, or hacks`)
                           .setEmoji(`💻`)
                           .setValue(`exploiting`)
                           .setDefault(mentions.includes(`exploiting`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Abusing a bug or glitch to gain an unfair advantage`)
                           .setEmoji(`🐛`)
                           .setValue(`bug-abuse`)
                           .setDefault(mentions.includes(`bug-abuse`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Built something explicit or sexual`)
                           .setEmoji(`🔞`)
                           .setValue(`sexual-build`)
                           .setDefault(mentions.includes(`sexual-build`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Being suggestive or sexual in-game`)
                           .setEmoji(`🔞`)
                           .setValue(`being-sexual`)
                           .setDefault(mentions.includes(`being-sexual`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Evading a ban with an alternate account`)
                           .setEmoji(`👥`)
                           .setValue(`ban-evasion`)
                           .setDefault(mentions.includes(`ban-evasion`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Moderator abusing their powers`)
                           .setEmoji(`🚨`)
                           .setValue(`moderator-abuse`)
                           .setDefault(mentions.includes(`moderator-abuse`)),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Another reason...`)
                           .setEmoji(`❓`)
                           .setValue(`other`)
                           .setDefault(mentions.includes(`other`))
                     )
                     .setMinValues(0)
                     .setMaxValues(15)
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
   await interaction.editReply({
      embeds,
      components
   });
};