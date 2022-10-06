import Discord from "discord.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, id = interaction.id ] = interaction.customId.split(`:`);


   // values to set in the modal
   const database = firestore.collection(`temporary-stuff`).doc(id);
   const {
      "rule-name":                ruleName               = ``,
      "message-content-contains": messageContentContains = ``,
      "reply-with":               replyWith              = ``
   } = (await database.get()).data() || {};


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`create-auto-response${id !== interaction.id ? `:${id}` : ``}`)
      .setTitle(`➕ create auto-response`)
      .setComponents([
         new Discord.ActionRowBuilder()
            .setComponents([
               new Discord.TextInputBuilder()
                  .setCustomId(`rule-name`)
                  .setLabel(`RULE NAME`)
                  .setPlaceholder(`🏷️ name of this rule`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMaxLength(75)
                  .setValue(ruleName)
                  .setRequired(true)
            ]),

         new Discord.ActionRowBuilder()
            .setComponents([
               new Discord.TextInputBuilder()
                  .setCustomId(`message-content-contains`)
                  .setLabel(`MESSAGE CONTENT CONTAINS`)
                  .setPlaceholder(`📋 list of phrases (separated by commas) that'll trigger this auto-response`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMaxLength(750)
                  .setValue(messageContentContains)
                  .setRequired(true)
            ]),

         new Discord.ActionRowBuilder()
            .setComponents([
               new Discord.TextInputBuilder()
                  .setCustomId(`reply-with`)
                  .setLabel(`REPLY WITH`)
                  .setPlaceholder(`💭 what to reply to the message that'll trigger this auto-response`)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setMaxLength(1000)
                  .setValue(replyWith)
                  .setRequired(true)
            ])
      ]);


   // show the modal
   return await interaction.showModal(modal);
};