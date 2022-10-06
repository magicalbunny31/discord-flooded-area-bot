import Discord from "discord.js";
import dayjs from "dayjs";

import { Timestamp } from "@google-cloud/firestore";

import { colours, emojis, set } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // fields
   const ruleName = interaction.fields
      .getTextInputValue(`rule-name`)
      .trim();

   const rawMessageContentContains = interaction.fields
      .getTextInputValue(`message-content-contains`)
      .trim();

   const messageContentContains = set(
      rawMessageContentContains
         .split(`,`)
         .map(phrase => phrase.trim())
         .filter(Boolean)
   );

   const replyWith = interaction.fields
      .getTextInputValue(`reply-with`)
      .trim();


   // editing an auto-response
   const isEditing = interaction.customId
      .split(`:`)
      .length > 1;


   // defer the interaction (if not editing)
   if (!isEditing)
      await interaction.deferReply({
         ephemeral: true
      });


   // set these values temporarily in the database
   let database = firestore.collection(`temporary-stuff`).doc(interaction.id);

   await database.set({
      "rule-name":                ruleName,
      "message-content-contains": rawMessageContentContains,
      "reply-with":               replyWith,
      "delete":                   new Timestamp(dayjs().add(1, `day`).unix(), 0)
   });


   // check for duplicate names
   database = firestore.collection(`command`).doc(`auto-responses`);

   const ruleNames = Object.keys((await database.get()).data());
   const isDuplicateName = ruleNames.includes(ruleName);


   // name cannot contain "/"
   const ruleNameContainsSlash = ruleName.includes(`/`);


   // embeds
   const invalid = !(ruleName && rawMessageContentContains && replyWith) || isDuplicateName || ruleNameContainsSlash;

   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setTitle(`\\➕ create auto-response`)
         .setFields({
            name: `🏷️ \`RULE NAME\``,
            value: ruleName || `${emojis.rip} **\`no name set..\`**`
         }, {
            name: `📋 \`MESSAGE CONTENT CONTAINS\``,
            value: messageContentContains
               .map(phrase => `> \`${phrase}\``)
               .join(`\n`)
            || `${emojis.rip} **\`no phrases set..\`**`
         }, {
            name: `💭 \`REPLY WITH\``,
            value: replyWith || `${emojis.rip} **\`no message set..\`**`
         }),

      ...invalid
         ? [
            new Discord.EmbedBuilder()
               .setColor(colours.red)
               .setFields({
                  name: `⚠️ problems`,
                  value: [
                     ...isDuplicateName
                        ? [ `> **specified \`RULE NAME\` is already a rule**` ] : [],
                     ...ruleNameContainsSlash
                        ? [ `> **specified \`RULE NAME\` cannot contain "/"**` ] : [],
                     ...!ruleName
                        ? [ `> **invalid \`RULE NAME\` field value**` ] : [],
                     ...!rawMessageContentContains
                        ? [ `> **invalid \`MESSAGE CONTENT CONTAINS\` field value**` ] : [],
                     ...!replyWith
                        ? [ `> **invalid \`REPLY WITH\` field value**` ] : []
                  ]
                     .join(`\n`)
               })
         ]
         : []
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`create-auto-response:${interaction.id}`)
               .setLabel(`edit auto-response`)
               .setEmoji(`📝`)
               .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
               .setCustomId(`confirm-create-auto-response:${interaction.id}`)
               .setLabel(`confirm create auto-response`)
               .setEmoji(`✅`)
               .setStyle(Discord.ButtonStyle.Success)
               .setDisabled(invalid)
         ])
   ];


   // edit the deferred interaction (if not editing)
   if (!isEditing)
      return await interaction.editReply({
         embeds,
         components
      });

   // update the interaction
   else
      return await interaction.update({
         embeds,
         components
      });
};