export const data = new Discord.SlashCommandBuilder()
   .setName(`channel`)
   .setDescription(`🔑 set some channels in the database for commands to work`)
   .addSubcommandGroup(
      new Discord.SlashCommandSubcommandGroupBuilder()
         .setName(`report-a-player`)
         .setDescription(`💬 manage the report a player channel`)
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`remove`)
               .setDescription(`🚫 remove the report a player channel`)
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`set`)
               .setDescription(`➕ set the report a player channel`)
               .addChannelOption(
                  new Discord.SlashCommandChannelOption()
                     .setName(`channel`)
                     .setDescription(`#️⃣ the report a player channel`)
                     .addChannelTypes(
                        Discord.ChannelType.GuildText
                     )
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`view`)
               .setDescription(`🔎 view the report a player channel`)
         )
   )
   .addSubcommandGroup(
      new Discord.SlashCommandSubcommandGroupBuilder()
         .setName(`suggestions`)
         .setDescription(`💬 manage the suggestion channels`)
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`remove`)
               .setDescription(`🚫 remove a suggestion channel`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`suggestion-channel`)
                     .setDescription(`📃 which suggestion channel to remove`)
                     .setChoices({
                        name: `🎮 game suggestions`,
                        value: `game-suggestions`
                     }, {
                        name: `📂 server suggestions`,
                        value: `server-suggestions`
                     }, {
                        name: `🧱 part suggestions`,
                        value: `part-suggestions`
                     }, {
                        name: `🐛 bug reports`,
                        value: `bug-reports`
                     })
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`set`)
               .setDescription(`➕ set a suggestion channel`)
               .addStringOption(
                  new Discord.SlashCommandStringOption()
                     .setName(`suggestion-channel`)
                     .setDescription(`📃 which suggestion channel to set`)
                     .setChoices({
                        name: `🎮 game suggestions`,
                        value: `game-suggestions`
                     }, {
                        name: `📂 server suggestions`,
                        value: `server-suggestions`
                     }, {
                        name: `🧱 part suggestions`,
                        value: `part-suggestions`
                     }, {
                        name: `🐛 bug reports`,
                        value: `bug-reports`
                     })
                     .setRequired(true)
               )
               .addChannelOption(
                  new Discord.SlashCommandChannelOption()
                     .setName(`channel`)
                     .setDescription(`#️⃣ the channel associated with this suggestion channel`)
                     .addChannelTypes(
                        Discord.ChannelType.GuildForum
                     )
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`view`)
               .setDescription(`🔎 view the suggestion channels`)
         )
   )
   .addSubcommandGroup(
      new Discord.SlashCommandSubcommandGroupBuilder()
         .setName(`ticket-logs`)
         .setDescription(`💬 manage the ticket logs channel`)
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`remove`)
               .setDescription(`🚫 remove the ticket logs channel`)
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`set`)
               .setDescription(`➕ set the ticket logs channel`)
               .addChannelOption(
                  new Discord.SlashCommandChannelOption()
                     .setName(`channel`)
                     .setDescription(`#️⃣ the ticket logs channel`)
                     .addChannelTypes(
                        Discord.ChannelType.GuildText
                     )
                     .setRequired(true)
               )
         )
         .addSubcommand(
            new Discord.SlashCommandSubcommandBuilder()
               .setName(`view`)
               .setDescription(`🔎 view the ticket logs channel`)
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
   const setChannelType = interaction.options.getSubcommandGroup();
   const action         = interaction.options.getSubcommand();

   const type    = interaction.options.getString(`suggestion-channel`);
   const channel = interaction.options.getChannel(`channel`);


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // database reference
   const database = firestore.collection(`channel`).doc(setChannelType);


   switch (action) {


      // remove a channel from database
      case `remove`: {
         // nothing to remove
         if (!((await database.get()).data() || {})[type || `channel`])
            return await interaction.editReply({
               content: strip`
                  ❌ **couldn't remove \`${setChannelType}\`'s ${type ? `channel type \`${type}\`` : `channel`}**
                  > \`${setChannelType}\` doesn't have a channel currently set, use ${Discord.chatInputApplicationCommandMention(`channel`, setChannelType, `set`, interaction.client.application.id)} to set a channel
               `
            });

         // remove the channel from the database
         if (type)
            await database.update({
               [type]: FieldValue.delete()
            });

         else
            await database.delete();

         // edit the deferred interaction
         return await interaction.editReply({
            content: strip`
               ✅ **removed \`${setChannelType}\`'s ${type ? `channel type \`${type}\`` : `channel`}!**
               > ${emojis.happ}
            `
         });
      };


      // set a channel in the database
      case `set`: {
         // set the channel in the database
         Object.entries((await database.get()).data() || {}).length
            ? await database.update({
               [type || `channel`]: channel.id
            })
            : await database.set({
               [type || `channel`]: channel.id
            });

         // edit the deferred interaction
         return await interaction.editReply({
            content: strip`
               ✅ **set \`${setChannelType}\`'s ${type ? `channel type \`${type}\`` : `channel`} to ${channel}!**
               > ${emojis.happ}
            `
         });
      };


      // view the channel(s) set in the database
      case `view`: {
         // get the channel(s) from the database
         const data = Object.entries((await database.get()).data() || {});

         // edit the deferred interaction
         return await interaction.editReply({
            content: data
               .map(([ type, channelId ]) => `\`${type}\` : ${Discord.channelMention(channelId)}`)
               .join(`\n`)
               || `\`no channels set..\``
         });
      };


   };
};