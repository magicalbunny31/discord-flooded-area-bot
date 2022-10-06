import Discord from "discord.js";
import dayjs from "dayjs";

import { Timestamp } from "@google-cloud/firestore";

import { colours, set } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal info
   const [ _modal, originalRuleName ] = interaction.customId.split(`:`);


   // fields
   const ruleName = interaction.fields
      .getTextInputValue(`rule-name`)
      .trim();

   const rawMessageContentContains = interaction.fields
      .getTextInputValue(`message-content-contains`)
      .trim();

   const replyWith = interaction.fields
      .getTextInputValue(`reply-with`)
      .trim();


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
   const isDuplicateName = ruleName !== originalRuleName && ruleNames.includes(ruleName);


   // this edit is invalid
   const invalid = !(ruleName && rawMessageContentContains && replyWith) || isDuplicateName;

   if (invalid)
      return await interaction.reply({
         embeds: [
            new Discord.EmbedBuilder()
               .setColor(colours.red)
               .setFields({
                  name: `⚠️ problems`,
                  value: [
                     ...isDuplicateName
                        ? [ `> **specified \`RULE NAME\` is already a rule**` ] : [],
                     ...!ruleName
                        ? [ `> **invalid \`RULE NAME\` field value**` ] : [],
                     ...!rawMessageContentContains
                        ? [ `> **invalid \`MESSAGE CONTENT CONTAINS\` field value**` ] : [],
                     ...!replyWith
                        ? [ `> **invalid \`REPLY WITH\` field value**` ] : []
                  ]
                     .join(`\n`)
               })
         ],
         components: [
            new Discord.ActionRowBuilder()
               .setComponents([
                  new Discord.ButtonBuilder()
                     .setCustomId(`edit-auto-response:${originalRuleName}:${interaction.id}`)
                     .setLabel(`edit auto-response`)
                     .setEmoji(`📝`)
                     .setStyle(Discord.ButtonStyle.Primary)
               ])
         ],
         ephemeral: true
      });


   // update the database
   await database.update({
      [ruleName]: {
         "message-content-contains": set(
            rawMessageContentContains
               .split(`,`)
               .map(phrase => phrase.trim())
               .filter(Boolean)
         ),
         "reply-with": replyWith
      }
   });


   // update the interaction
   return await interaction.update({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setFields({
               name: `🏷️ \`RULE NAME\``,
               value: ruleName
            }, {
               name: `📋 \`MESSAGE CONTENT CONTAINS\``,
               value: rawMessageContentContains
                  .split(`,`)
                  .map(phrase => phrase.trim())
                  .filter(Boolean)
                  .map(phrase => `> \`${phrase}\``)
                  .join(`\n`)
            }, {
               name: `💭 \`REPLY WITH\``,
               value: replyWith
            })
      ]
   });
};