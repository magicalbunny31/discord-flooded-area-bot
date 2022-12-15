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


   // database stuff
   let database = firestore.collection(`role`).doc(`moderation-team`);
   const { role: moderationTeam } = (await database.get()).data();


   // roles
   const roles = interaction.member.roles.cache;

   database = firestore.collection(`role`);
   const mentionRoles = (await database.doc(`mention-roles`).get()).data();
   const pronounRoles = (await database.doc(`pronoun-roles`).get()).data();


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`select-roles:mention-roles`)
               .setPlaceholder(`select mention roles..`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`looking for group`)
                     .setValue(`looking-for-group`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`looking-for-group`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`events`)
                     .setValue(`events`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`events`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`polls`)
                     .setValue(`polls`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`polls`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`updates/sneak peaks`)
                     .setValue(`updates-sneak-peaks`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`updates-sneak-peaks`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`giveaways`)
                     .setValue(`giveaways`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`giveaways`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`challenges`)
                     .setValue(`challenges`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`challenges`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`doruk's exceptional pings`)
                     .setValue(`doruk's-exceptional-pings`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`doruk's-exceptional-pings`])),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`/votekick pings`)
                     .setValue(`votekick-pings`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`votekick-pings`]))
               )
               .setMinValues(0)
               .setMaxValues(8)
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`select-roles:pronoun-roles`)
               .setPlaceholder(`select pronoun roles..`)
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
                     .setDefault(roles.has(pronounRoles[`ask-for-pronouns`]))
               )
               .setMinValues(0)
               .setMaxValues(5)
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
            .setCustomId(`what-are-pronouns`)
               .setLabel(`what are pronouns?`)
               .setEmoji(`❓`)
               .setStyle(Discord.ButtonStyle.Secondary)
         )
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      content: strip`
         pronoun roles are simply here to make it easier for everyone to refer to one another!
         misusing the roles will result in punishment
         please be mature about this ${emojis.happ}
         ~ ${Discord.roleMention(moderationTeam)}
      `,
      components
   });
};