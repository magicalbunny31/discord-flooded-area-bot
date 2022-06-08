export const name = `interactionCreate`;
export const once = false;


import Discord from "discord.js";
// import { url } from "@magicalbunny31/awesome-utility-stuff";
const url = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i; // https://stackoverflow.com/a/15855457

/**
 * @param {Discord.Interaction} interaction
 */
export default async interaction => {
   // this file is for ModalSubmitInteractions
   if (!interaction.isModalSubmit())
      return;


   // get the type of suggestion
   const [ id, type ] = interaction.customId.split(`:`);


   // depending on the modal, it'll have multiple fields
   const suggestionOrName             = interaction.components[0] .components[0].value;         // suggestions for game/server  /  name        for part
   const imageOrNullOrPartDescription = interaction.components[1]?.components[0].value || null; // image       for game/server  /  description for part
   const partImageOrNull              = interaction.components[2]?.components[0].value || null; //                                 image       for part

   const isPartSuggestion = interaction.components[0].components[0].customId === `name`;
   const hasImage = !!(!isPartSuggestion ? imageOrNullOrPartDescription : partImageOrNull);
   const isWellFormedImageURL = hasImage
      ? !isPartSuggestion
         ? url.test(imageOrNullOrPartDescription)
         : url.test(partImageOrNull)
      : true;


   // preview embed
   const embeds =
      !isPartSuggestion
         ? isWellFormedImageURL
            ? [
               new Discord.EmbedBuilder()
                  .setColor(0xffee00)
                  .setAuthor({
                     name: `${interaction.user.tag}\n(${interaction.user.id})`,
                     iconURL: interaction.user.displayAvatarURL()
                  })
                  .setDescription(suggestionOrName.trim() || `**\`You must enter a suggestion.\`**`)
                  .setImage(imageOrNullOrPartDescription)
            ]
            : [
               new Discord.EmbedBuilder()
                  .setColor(0xffee00)
                  .setAuthor({
                     name: `${interaction.user.tag}\n(${interaction.user.id})`,
                     iconURL: interaction.user.displayAvatarURL()
                  })
                  .setDescription(suggestionOrName.trim() || `**\`You must enter a suggestion.\`**`)
                  .setFields([
                     {
                        name: `IMAGE`,
                        value: `**\`You must enter a valid image URL.\`**`
                     }
                  ])
            ]
         : isWellFormedImageURL
            ? [
               new Discord.EmbedBuilder()
                  .setColor(0xffee00)
                  .setAuthor({
                     name: `${interaction.user.tag}\n(${interaction.user.id})`,
                     iconURL: interaction.user.displayAvatarURL()
                  })
                  .setFields([
                     {
                        name: `PART NAME`,
                        value: suggestionOrName.trim() || `**\`You must enter a name.\`**`
                     }, {
                        name: `PART DESCRIPTION`,
                        value: imageOrNullOrPartDescription.trim() || `**\`You must enter a description.\`**`
                     }
                  ])
                  .setImage(partImageOrNull)
            ]
            : [
               new Discord.EmbedBuilder()
                  .setColor(0xffee00)
                  .setAuthor({
                     name: `${interaction.user.tag}\n(${interaction.user.id})`,
                     iconURL: interaction.user.displayAvatarURL()
                  })
                  .setFields([
                     {
                        name: `PART NAME`,
                        value: suggestionOrName.trim() || `**\`You must enter a name.\`**`
                     }, {
                        name: `PART DESCRIPTION`,
                        value: imageOrNullOrPartDescription.trim() || `**\`You must enter a description.\`**`
                     }, {
                        name: `IMAGE`,
                        value: `**\`You must enter a valid image URL.\`**`
                     }
                  ])
            ];



   // run what this modal submit does
   switch (id) {


      case `edit-suggestion`: {
         // preview components
         const isInvalid = (!suggestionOrName.trim() || (isPartSuggestion && !imageOrNullOrPartDescription?.trim())) && isWellFormedImageURL;

         const components = [
            new Discord.ActionRowBuilder()
               .setComponents([
                  new Discord.ButtonBuilder()
                     .setCustomId(`${interaction.id}:edit-suggestion`)
                     .setStyle(Discord.ButtonStyle.Primary)
                     .setEmoji(`📝`)
                     .setLabel(`Edit Suggestion`),

                  new Discord.ButtonBuilder()
                     .setCustomId(`${interaction.id}:send-suggestion`)
                     .setStyle(Discord.ButtonStyle.Success)
                     .setEmoji(`✅`)
                     .setLabel(`Confirm Edit`)
                     .setDisabled(!!isInvalid)
               ])
         ];


         // reply to the interaction if this was from the select menu
         if (!interaction.message?.webhookId)
            await interaction.reply({
               embeds: [
                  ...embeds,
                  new Discord.EmbedBuilder()
                     .setColor(interaction.user.accentColor || (await interaction.user.fetch(true)).accentColor)
                     .setDescription(`**Your previous edits will be visible to everyone via the suggestion's discussion thread.**`)
               ],
               components,
               ephemeral: true
            });

         // update the message if this was from a button
         else
            await interaction.update({
               embeds: [
                  ...embeds,
                  new Discord.EmbedBuilder()
                     .setColor(interaction.user.accentColor || (await interaction.user.fetch(true)).accentColor)
                     .setDescription(`**Your previous edits will be visible to everyone via the suggestion's discussion thread.**`)
               ],
               components
            });


         try {

            // await for a button boop
            const button = await interaction.channel.awaitMessageComponent({
               filter: i => i.customId.startsWith(interaction.id),
               time: 8.64e+7 // 24 hours
            });


            if (button.customId.endsWith(`edit-suggestion`)) { // edit suggestion

               // show the modal with their inputted values
               switch (type) {

                  case `game`:
                     return await button.showModal(
                        new Discord.ModalBuilder()
                           .setCustomId(`suggestion:game`)
                           .setTitle(`Game Suggestion`)
                           .setComponents([
                              new Discord.ActionRowBuilder()
                                 .setComponents([
                                    new Discord.TextInputBuilder()
                                       .setCustomId(`suggestion`)
                                       .setLabel(`YOUR SUGGESTION`)
                                       .setPlaceholder(`🎮 What is your suggestion for the game?`)
                                       .setRequired(true)
                                       .setStyle(Discord.TextInputStyle.Paragraph)
                                       .setValue(suggestionOrName)
                                 ]),
                              new Discord.ActionRowBuilder()
                                 .setComponents([
                                    new Discord.TextInputBuilder()
                                       .setCustomId(`image`)
                                       .setMaxLength(2048)
                                       .setLabel(`IMAGE`)
                                       .setPlaceholder(`🔗 Add an optional image url to show.`)
                                       .setRequired(false)
                                       .setStyle(Discord.TextInputStyle.Short)
                                       .setValue(imageOrNullOrPartDescription || ``)
                                 ])
                           ])
                     );

                  case `server`:
                     return await button.showModal(
                        new Discord.ModalBuilder()
                           .setCustomId(`suggestion:server`)
                           .setTitle(`Server Suggestion`)
                           .setComponents([
                              new Discord.ActionRowBuilder()
                                 .setComponents([
                                    new Discord.TextInputBuilder()
                                       .setCustomId(`suggestion`)
                                       .setLabel(`YOUR SUGGESTION`)
                                       .setPlaceholder(`💬 What is your suggestion for the server?`)
                                       .setRequired(true)
                                       .setStyle(Discord.TextInputStyle.Paragraph)
                                       .setValue(suggestionOrName)
                                 ]),
                              new Discord.ActionRowBuilder()
                                 .setComponents([
                                    new Discord.TextInputBuilder()
                                       .setCustomId(`image`)
                                       .setMaxLength(2048)
                                       .setLabel(`IMAGE`)
                                       .setPlaceholder(`🔗 Add an optional image url to show.`)
                                       .setRequired(false)
                                       .setStyle(Discord.TextInputStyle.Short)
                                       .setValue(imageOrNullOrPartDescription || ``)
                                 ])
                           ])
                     );

                  case `part`:
                     return await button.showModal(
                        new Discord.ModalBuilder()
                           .setCustomId(`suggestion:part`)
                           .setTitle(`Part Suggestion`)
                           .setComponents([
                              new Discord.ActionRowBuilder()
                                 .setComponents([
                                    new Discord.TextInputBuilder()
                                       .setCustomId(`name`)
                                       .setMaxLength(1024)
                                       .setLabel(`PART NAME`)
                                       .setPlaceholder(`🏷️ What is this part's name?`)
                                       .setRequired(true)
                                       .setStyle(Discord.TextInputStyle.Short)
                                       .setValue(suggestionOrName)
                                 ]),
                              new Discord.ActionRowBuilder()
                                 .setComponents([
                                    new Discord.TextInputBuilder()
                                       .setCustomId(`description`)
                                       .setMaxLength(1024)
                                       .setLabel(`PART DESCRIPTION`)
                                       .setPlaceholder(`📰 Describe what this part does.`)
                                       .setRequired(true)
                                       .setStyle(Discord.TextInputStyle.Paragraph)
                                       .setValue(imageOrNullOrPartDescription)
                                 ]),
                              new Discord.ActionRowBuilder()
                                 .setComponents([
                                    new Discord.TextInputBuilder()
                                       .setCustomId(`image`)
                                       .setMaxLength(2048)
                                       .setLabel(`IMAGE`)
                                       .setPlaceholder(`🔗 Add an optional image url to show.`)
                                       .setRequired(false)
                                       .setStyle(Discord.TextInputStyle.Short)
                                       .setValue(partImageOrNull || ``)
                                 ])
                           ])
                     );

               };


            } else { // confirm edits

               // "defer" the reply
               await button.update({
                  embeds: [
                     ...embeds,
                     new Discord.EmbedBuilder()
                        .setColor(interaction.user.accentColor || (await interaction.user.fetch(true)).accentColor)
                        .setDescription(`**Confirming edits...**`)
                  ],
                  components: []
               });

               // fetch the suggestion message
               const [ _id, _type, inChannelId, messageId ] = interaction.customId.split(`:`);
               const channel = await button.guild.channels.fetch(inChannelId);
               const message = await channel.messages.fetch(messageId);

               // get the discussion thread
               const thread = message.hasThread
                  ? message.thread
                  : await message.startThread({
                     name: `Suggestion Discussions`
                  });

               // send the suggestion before edit in its discussion thread
               await thread.send({
                  content: `Edit from ${Discord.Formatters.time(Math.floor(button.createdTimestamp / 1000), Discord.TimestampStyles.RelativeTime)} (${Discord.Formatters.time(Math.floor(button.createdTimestamp / 1000))})`,
                  embeds: message.embeds
               });

               // edit the suggestion
               await message.edit({
                  embeds,
                  components: []
               });

               // edit the reply to show that the suggestion was sent
               return await button.editReply({
                  embeds: [
                     ...embeds,
                     new Discord.EmbedBuilder()
                        .setColor(interaction.user.accentColor || (await interaction.user.fetch(true)).accentColor)
                        .setDescription(`**Your [suggestion](${message.url})'s edits in ${channel} have been confirmed!**`)
                  ]
               });

            };


         } catch {
            // the wait for a MessageComponentInteraction timed out
            // it's extremely unlikely that a user will see this after 24 hours
            // so the bot will just stop here and assume the message was dismissed
            // instead, we'll just believe than an error happened
            try {
               return await interaction.editReply({
                  content: `**\`An error has occurred.\`**`,
                  embeds: [],
                  components: []
               });
            } catch {
               // what a disaster! we did all we could, chef
               return;
            };
         };
      };


      case `suggestion`: {
         // preview components
         const isInvalid = (!suggestionOrName.trim() || (isPartSuggestion && !imageOrNullOrPartDescription?.trim())) && isWellFormedImageURL;

         const components = [
            new Discord.ActionRowBuilder()
               .setComponents([
                  new Discord.ButtonBuilder()
                     .setCustomId(`${interaction.id}:edit-suggestion`)
                     .setStyle(Discord.ButtonStyle.Primary)
                     .setEmoji(`📝`)
                     .setLabel(`Edit Suggestion`),

                  new Discord.ButtonBuilder()
                     .setCustomId(`${interaction.id}:send-suggestion`)
                     .setStyle(Discord.ButtonStyle.Success)
                     .setEmoji(`✅`)
                     .setLabel(`Send Suggestion`)
                     .setDisabled(!!isInvalid)
               ])
         ];


         // reply to the interaction if this was from the select menu
         if (!interaction.message.webhookId)
            await interaction.reply({
               embeds,
               components,
               ephemeral: true
            });

         // update the message if this was from a button
         else
            await interaction.update({
               embeds,
               components
            });


         try {

            // await for a button boop
            const button = await interaction.channel.awaitMessageComponent({
               filter: i => i.customId.startsWith(interaction.id),
               time: 8.64e+7 // 24 hours
            });


            if (button.customId.endsWith(`edit-suggestion`)) { // edit suggestion

               // show the modal with their inputted values
               switch (type) {

                  case `game`:
                     return await button.showModal(
                        new Discord.ModalBuilder()
                           .setCustomId(`suggestion:game`)
                           .setTitle(`Game Suggestion`)
                           .setComponents([
                              new Discord.ActionRowBuilder()
                                 .setComponents([
                                    new Discord.TextInputBuilder()
                                       .setCustomId(`suggestion`)
                                       .setLabel(`YOUR SUGGESTION`)
                                       .setPlaceholder(`🎮 What is your suggestion for the game?`)
                                       .setRequired(true)
                                       .setStyle(Discord.TextInputStyle.Paragraph)
                                       .setValue(suggestionOrName)
                                 ]),
                              new Discord.ActionRowBuilder()
                                 .setComponents([
                                    new Discord.TextInputBuilder()
                                       .setCustomId(`image`)
                                       .setMaxLength(2048)
                                       .setLabel(`IMAGE`)
                                       .setPlaceholder(`🔗 Add an optional image url to show.`)
                                       .setRequired(false)
                                       .setStyle(Discord.TextInputStyle.Short)
                                       .setValue(imageOrNullOrPartDescription || ``)
                                 ])
                           ])
                     );

                  case `server`:
                     return await button.showModal(
                        new Discord.ModalBuilder()
                           .setCustomId(`suggestion:server`)
                           .setTitle(`Server Suggestion`)
                           .setComponents([
                              new Discord.ActionRowBuilder()
                                 .setComponents([
                                    new Discord.TextInputBuilder()
                                       .setCustomId(`suggestion`)
                                       .setLabel(`YOUR SUGGESTION`)
                                       .setPlaceholder(`💬 What is your suggestion for the server?`)
                                       .setRequired(true)
                                       .setStyle(Discord.TextInputStyle.Paragraph)
                                       .setValue(suggestionOrName)
                                 ]),
                              new Discord.ActionRowBuilder()
                                 .setComponents([
                                    new Discord.TextInputBuilder()
                                       .setCustomId(`image`)
                                       .setMaxLength(2048)
                                       .setLabel(`IMAGE`)
                                       .setPlaceholder(`🔗 Add an optional image url to show.`)
                                       .setRequired(false)
                                       .setStyle(Discord.TextInputStyle.Short)
                                       .setValue(imageOrNullOrPartDescription || ``)
                                 ])
                           ])
                     );

                  case `part`:
                     return await button.showModal(
                        new Discord.ModalBuilder()
                           .setCustomId(`suggestion:part`)
                           .setTitle(`Part Suggestion`)
                           .setComponents([
                              new Discord.ActionRowBuilder()
                                 .setComponents([
                                    new Discord.TextInputBuilder()
                                       .setCustomId(`name`)
                                       .setMaxLength(1024)
                                       .setLabel(`PART NAME`)
                                       .setPlaceholder(`🏷️ What is this part's name?`)
                                       .setRequired(true)
                                       .setStyle(Discord.TextInputStyle.Short)
                                       .setValue(suggestionOrName)
                                 ]),
                              new Discord.ActionRowBuilder()
                                 .setComponents([
                                    new Discord.TextInputBuilder()
                                       .setCustomId(`description`)
                                       .setMaxLength(1024)
                                       .setLabel(`PART DESCRIPTION`)
                                       .setPlaceholder(`📰 Describe what this part does.`)
                                       .setRequired(true)
                                       .setStyle(Discord.TextInputStyle.Paragraph)
                                       .setValue(imageOrNullOrPartDescription)
                                 ]),
                              new Discord.ActionRowBuilder()
                                 .setComponents([
                                    new Discord.TextInputBuilder()
                                       .setCustomId(`image`)
                                       .setMaxLength(2048)
                                       .setLabel(`IMAGE`)
                                       .setPlaceholder(`🔗 Add an optional image url to show.`)
                                       .setRequired(false)
                                       .setStyle(Discord.TextInputStyle.Short)
                                       .setValue(partImageOrNull || ``)
                                 ])
                           ])
                     );

               };


            } else { // send suggestion

               // "defer" the reply
               await button.update({
                  embeds: [
                     ...embeds,
                     new Discord.EmbedBuilder()
                        .setColor(interaction.user.accentColor || (await interaction.user.fetch(true)).accentColor)
                        .setDescription(`**Sending suggestion...**`)
                  ],
                  components: []
               });

               // ids of the channels for each suggestion type
               const channelIds = {
                  game:   `983391293583523881`,
                  server: `983391792131108885`,
                  part:   `983391983487815791`
               };

               // send the message to the channel
               const channel = await button.guild.channels.fetch(channelIds[type]);
               const message = await channel.send({
                  embeds,
                  components: [
                     new Discord.ActionRowBuilder()
                        .setComponents([
                           new Discord.ButtonBuilder()
                              .setCustomId(`create-discussion-thread`)
                              .setLabel(`Create Discussion Thread`)
                              .setStyle(Discord.ButtonStyle.Primary)
                              .setEmoji(`💬`)
                        ])
                  ]
               });

               // react to the message
               await message.react(`⬆️`);
               await message.react(`⬇️`);

               // edit the reply to show that the suggestion was sent
               return await button.editReply({
                  embeds: [
                     ...embeds,
                     new Discord.EmbedBuilder()
                        .setColor(interaction.user.accentColor || (await interaction.user.fetch(true)).accentColor)
                        .setDescription(`**Your [suggestion](${message.url}) has been sent to ${message.channel}!**`)
                  ]
               });

            };


         } catch {
            // the wait for a MessageComponentInteraction timed out
            // it's extremely unlikely that a user will see this after 24 hours
            // so the bot will just stop here and assume the message was dismissed
            // instead, we'll just believe than an error happened
            try {
               return await interaction.editReply({
                  content: `**\`An error has occurred.\`**`,
                  embeds: [],
                  components: []
               });
            } catch {
               // what a disaster! we did all we could, chef
               return;
            };
         };
      };


   };
};