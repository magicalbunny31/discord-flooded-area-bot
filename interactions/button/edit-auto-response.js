import Discord from "discord.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, name, id ] = interaction.customId.split(`:`);


   // values to set in the modal
   const database = id
      ? firestore.collection(`temporary-stuff`).doc(id)
      : firestore.collection(`command`)        .doc(`auto-responses`);

   const {
      "rule-name":                ruleName,
      "message-content-contains": messageContentContains,
      "reply-with":               replyWith
   } = id
      ? (await database.get()).data()
      : (await database.get()).data()[name];


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`edit-auto-response:${name}`)
      .setTitle(`📝 edit auto-response`)
      .setComponents([
         new Discord.ActionRowBuilder()
            .setComponents([
               new Discord.TextInputBuilder()
                  .setCustomId(`rule-name`)
                  .setLabel(`RULE NAME`)
                  .setPlaceholder(`🏷️ name of this rule`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMaxLength(75)
                  .setValue(id ? ruleName : name)
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
                  .setValue(
                     id
                        ? messageContentContains
                        : messageContentContains.join(`, `).length <= 750
                           ? messageContentContains.join(`, `)
                           : messageContentContains.join(`,`)
                     || ``
                  )
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