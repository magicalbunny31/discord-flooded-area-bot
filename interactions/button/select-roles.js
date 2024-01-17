export const name = "select-roles";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // roles
   const roles = interaction.member.roles.cache;

   const mentionRoles = {
      "looking-for-group":   process.env.FA_ROLE_LOOKING_FOR_GROUP,
      "events":              process.env.FA_ROLE_EVENTS,
      "polls":               process.env.FA_ROLE_POLLS,
      "updates-sneak-peeks": process.env.FA_ROLE_UPDATES_SNEAK_PEEKS,
      "giveaways":           process.env.FA_ROLE_GIVEAWAYS,
      "challenges":          process.env.FA_ROLE_CHALLENGES,
      "playtest":            process.env.FA_ROLE_PLAYTEST,
      "archived-access":     process.env.FA_ROLE_ARCHIVED_ACCESS,
      "qotd":                process.env.FA_ROLE_QOTD
   };

   const pronounRoles = {
      "he-him":           process.env.FA_ROLE_HE_HIM,
      "she-her":          process.env.FA_ROLE_SHE_HER,
      "they-them":        process.env.FA_ROLE_THEY_THEM,
      "other-pronouns":   process.env.FA_ROLE_OTHER_PRONOUNS,
      "any-pronouns":     process.env.FA_ROLE_ANY_PRONOUNS,
      "ask-for-pronouns": process.env.FA_ROLE_ASK_FOR_PRONOUNS
   };


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`select-roles:mention-roles`)
               .setPlaceholder(`Select mention roles...`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Looking For Group`)
                     .setValue(`looking-for-group`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`looking-for-group`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Events`)
                     .setValue(`events`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`events`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Polls`)
                     .setValue(`polls`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`polls`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Updates/Sneak Peeks`)
                     .setValue(`updates-sneak-peeks`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`updates-sneak-peeks`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Giveaways`)
                     .setValue(`giveaways`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`giveaways`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Challenges`)
                     .setValue(`challenges`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`challenges`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Playtest`)
                     .setValue(`playtest`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`playtest`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Archived Access`)
                     .setValue(`archived-access`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`archived-access`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`QoTD`)
                     .setValue(`qotd`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`qotd`]))
               )
               .setMinValues(0)
               .setMaxValues(9)
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`select-roles:pronoun-roles`)
               .setPlaceholder(`Select pronoun roles...`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`he/him`)
                     .setValue(`he-him`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(pronounRoles[`he-him`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`she/her`)
                     .setValue(`she-her`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(pronounRoles[`she-her`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`they/them`)
                     .setValue(`they-them`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(pronounRoles[`they-them`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`other pronouns`)
                     .setValue(`other-pronouns`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(pronounRoles[`other-pronouns`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`ask for pronouns`)
                     .setValue(`ask-for-pronouns`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(pronounRoles[`ask-for-pronouns`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`any pronouns`)
                     .setValue(`any-pronouns`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(pronounRoles[`any-pronouns`]))
               )
               .setMinValues(0)
               .setMaxValues(6)
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`what-are-pronouns`)
               .setLabel(`What are pronouns?`)
               .setEmoji(`❓`)
               .setStyle(Discord.ButtonStyle.Secondary)
         )
   ];


   // edit the deferred interaction
   await interaction.editReply({
      content: strip`
         Pronoun roles are simply here to make it easier for everyone to refer to one another!
         Misusing the roles will result in punishment: please be mature about this.
         ~ ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} ${emojis.happ}
      `,
      components
   });
};