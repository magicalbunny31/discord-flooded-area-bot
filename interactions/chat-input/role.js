export const data = new Discord.SlashCommandBuilder()
   .setName(`role`)
   .setDescription(`🔑 set some roles in the database for commands to work`)
   .addSubcommandGroup(
      new Discord.SlashCommandSubcommandGroupBuilder()
         .setName(`bunny-was-here`)
         .setDescription(`🐇 manage the bunny was here role`)
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`remove`)
               .setDescription(`🚫 remove the bunny was here role`)
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`set`)
               .setDescription(`➕ set the bunny was here role`)
               .addRoleOption(
                  new Discord.SlashCommandRoleOption()
                     .setName(`role`)
                     .setDescription(`🐇 the bunny was here role`)
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`view`)
               .setDescription(`🔎 view the bunny was here role`)
         )
   )
   .addSubcommandGroup(
      new Discord.SlashCommandSubcommandGroupBuilder()
         .setName(`event-host`)
         .setDescription(`🎉 manage the event host role`)
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`remove`)
               .setDescription(`🚫 remove the event host role`)
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`set`)
               .setDescription(`➕ set the event host role`)
               .addRoleOption(
                  new Discord.SlashCommandRoleOption()
                     .setName(`role`)
                     .setDescription(`📛 the event host role`)
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`view`)
               .setDescription(`🔎 view the event host role`)
         )
   )
   .addSubcommandGroup(
      new Discord.SlashCommandSubcommandGroupBuilder()
         .setName(`mention-roles`)
         .setDescription(`🗯️ manage the mention roles`)
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`remove`)
               .setDescription(`🚫 remove a mention role`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`mention-role`)
                     .setDescription(`📛 which mention role to remove`)
                     .setChoices({
                        name: `👥 looking for group`,
                        value: `looking-for-group`
                     }, {
                        name: `🗓️ events`,
                        value: `events`
                     }, {
                        name: `📊 polls`,
                        value: `polls`
                     }, {
                        name: `📣 updates/sneak peaks`,
                        value: `updates-sneak-peaks`
                     }, {
                        name: `🎉 giveaways`,
                        value: `giveaways`
                     }, {
                        name: `⚔️ challenges`,
                        value: `challenges`
                     }, {
                        name: `🗣️ doruk's exceptional pings`,
                        value: `doruk's-exceptional-pings`
                     }, {
                        name: `📢 /votekick pings`,
                        value: `votekick-pings`
                     })
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`set`)
               .setDescription(`➕ set a mention role`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`mention-role`)
                     .setDescription(`📛 which mention role to set`)
                     .setChoices({
                        name: `👥 looking for group`,
                        value: `looking-for-group`
                     }, {
                        name: `🗓️ events`,
                        value: `events`
                     }, {
                        name: `📊 polls`,
                        value: `polls`
                     }, {
                        name: `📣 updates/sneak peaks`,
                        value: `updates-sneak-peaks`
                     }, {
                        name: `🎉 giveaways`,
                        value: `giveaways`
                     }, {
                        name: `⚔️ challenges`,
                        value: `challenges`
                     }, {
                        name: `🗣️ doruk's exceptional pings`,
                        value: `doruk's-exceptional-pings`
                     }, {
                        name: `📢 /votekick pings`,
                        value: `votekick-pings`
                     })
                     .setRequired(true)
               )
               .addRoleOption(
                  new Discord.SlashCommandRoleOption()
                     .setName(`role`)
                     .setDescription(`📛 the role associated with this mention role`)
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`view`)
               .setDescription(`🔎 view the mention roles`)
         )
   )
   .addSubcommandGroup(
      new Discord.SlashCommandSubcommandGroupBuilder()
         .setName(`moderation-team`)
         .setDescription(`👥 manage the moderation team role`)
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`remove`)
               .setDescription(`🚫 remove the moderation team role`)
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`set`)
               .setDescription(`➕ set the moderation team role`)
               .addRoleOption(
                  new Discord.SlashCommandRoleOption()
                     .setName(`role`)
                     .setDescription(`📛 the moderation team role`)
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`view`)
               .setDescription(`🔎 view the moderation team role`)
         )
   )
   .addSubcommandGroup(
      new Discord.SlashCommandSubcommandGroupBuilder()
         .setName(`pronoun-roles`)
         .setDescription(`💭 manage the pronoun roles`)
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`remove`)
               .setDescription(`🚫 remove a pronoun role`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`pronoun-role`)
                     .setDescription(`📛 which pronoun role to remove`)
                     .setChoices({
                        name: `💬 he/him`,
                        value: `he-him`
                     }, {
                        name: `💬 she/her`,
                        value: `she-her`
                     }, {
                        name: `💬 they/them`,
                        value: `they-them`
                     }, {
                        name: `💬 other pronouns`,
                        value: `other`
                     }, {
                        name: `💬 ask for pronouns`,
                        value: `ask-for-pronouns`
                     })
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`set`)
               .setDescription(`➕ set a pronoun role`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`pronoun-role`)
                     .setDescription(`📛 which pronoun role to set`)
                     .setChoices({
                        name: `💬 he/him`,
                        value: `he-him`
                     }, {
                        name: `💬 she/her`,
                        value: `she-her`
                     }, {
                        name: `💬 they/them`,
                        value: `they-them`
                     }, {
                        name: `💬 other pronouns`,
                        value: `other-pronouns`
                     }, {
                        name: `💬 ask for pronouns`,
                        value: `ask-for-pronouns`
                     })
                     .setRequired(true)
               )
               .addRoleOption(
                  new Discord.SlashCommandRoleOption()
                     .setName(`role`)
                     .setDescription(`📛 the role associated with this pronoun role`)
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`view`)
               .setDescription(`🔎 view the pronoun roles`)
         )
   )
   .addSubcommandGroup(
      new Discord.SlashCommandSubcommandGroupBuilder()
         .setName(`suggestions-banned`)
         .setDescription(`⛔ manage the suggestions banned role`)
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`remove`)
               .setDescription(`🚫 remove the suggestions banned role`)
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`set`)
               .setDescription(`➕ set the suggestions banned role`)
               .addRoleOption(
                  new Discord.SlashCommandRoleOption()
                     .setName(`role`)
                     .setDescription(`📛 the suggestions banned role`)
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`view`)
               .setDescription(`🔎 view the suggestions banned role`)
         )
   )
   .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageChannels);

export const guildOnly = true;


import Discord from "discord.js";
import { FieldValue } from "@google-cloud/firestore";

import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const setRoleType = interaction.options.getSubcommandGroup();
   const action         = interaction.options.getSubcommand();

   const type = interaction.options.getString(`mention-role`) || interaction.options.getString(`pronoun-role`);
   const role = interaction.options.getRole(`role`);


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // database reference
   const database = firestore.collection(`role`).doc(setRoleType);


   switch (action) {


      // remove a role from database
      case `remove`: {
         // nothing to remove
         if (!((await database.get()).data() || {})[type || `role`])
            return await interaction.editReply({
               content: strip`
                  ❌ **couldn't remove \`${setRoleType}\`'s ${type ? `role type \`${type}\`` : `role`}**
                  > \`${setRoleType}\` doesn't have a role currently set, use ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`role`, setRoleType, `set`, interaction.client.application.id)} to set a role
               `
            });

         // remove the role from the database
         if (type)
            await database.update({
               [type]: FieldValue.delete()
            });

         else
            await database.delete();

         // edit the deferred interaction
         return await interaction.editReply({
            content: strip`
               ✅ **removed \`${setRoleType}\`'s ${type ? `role type \`${type}\`` : `role`}!**
               > ${emojis.happ}
            `
         });
      };


      // set a role in the database
      case `set`: {
         // set the role in the database
         Object.entries((await database.get()).data() || {}).length
            ? await database.update({
               [type || `role`]: role.id
            })
            : await database.set({
               [type || `role`]: role.id
            });

         // edit the deferred interaction
         return await interaction.editReply({
            content: strip`
               ✅ **set \`${setRoleType}\`'s ${type ? `role type \`${type}\`` : `role`} to ${role}!**
               > ${emojis.happ}
            `
         });
      };


      // view the role(s) set in the database
      case `view`: {
         // get the role(s) from the database
         const data = Object.entries((await database.get()).data() || {});

         // edit the deferred interaction
         return await interaction.editReply({
            content: data
               .map(([ type, roleId ]) => `\`${type}\` : ${Discord.roleMention(roleId)}`)
               .join(`\n`)
               || `\`no roles set..\``
         });
      };


   };
};