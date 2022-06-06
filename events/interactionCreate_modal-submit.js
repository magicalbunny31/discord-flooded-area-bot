export const name = `interactionCreate`;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Interaction} interaction
 */
export default async interaction => {
   // this file is for ModalSubmitInteractions
   if (!interaction.isModalSubmit())
      return;


   // type of suggestion
   const type = interaction.customId.split(`:`)[1];


   // depending on the modal, it'll have multiple fields
   const suggestion      = interaction.components[0] .components[0].value; // suggestions for game/server  /  name        for part
   const partDescription = interaction.components[1]?.components[0].value; //                                 description for part


   // preview embed
   const embeds =
      !partDescription
         ? [
            new Discord.EmbedBuilder()
               .setColor(0x4de94c)
               .setAuthor({
                  name: `${interaction.user.tag}\n(${interaction.user.id})`,
                  iconURL: interaction.user.displayAvatarURL()
               })
               .setDescription(suggestion.trim() || `**\`You must enter a suggestion.\`**`)
         ]
         : [
            new Discord.EmbedBuilder()
               .setColor(0x4de94c)
               .setAuthor({
                  name: `${interaction.user.tag}\n(${interaction.user.id})`,
                  iconURL: interaction.user.displayAvatarURL()
               })
               .setFields([
                  {
                     name: `PART NAME`,
                     value: suggestion.trim() || `**\`You must enter a name.\`**`
                  }, {
                     name: `PART DESCRIPTION`,
                     value: partDescription.trim() || `**\`You must enter a description.\`**`
                  }
               ])
         ];


   // preview components
   const hasEmptyFields = !suggestion.trim() || (partDescription && !partDescription?.trim());

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
               .setDisabled(!!hasEmptyFields)
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
                                 .setPlaceholder(`What is your suggestion for the game?`)
                                 .setRequired(true)
                                 .setStyle(Discord.TextInputStyle.Paragraph)
                                 .setValue(suggestion)
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
                                 .setPlaceholder(`What is your suggestion for the server?`)
                                 .setRequired(true)
                                 .setStyle(Discord.TextInputStyle.Paragraph)
                                 .setValue(suggestion)
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
                                 .setCustomId(`suggestion`)
                                 .setMaxLength(1024)
                                 .setLabel(`PART NAME`)
                                 .setPlaceholder(`What is this part's name?`)
                                 .setRequired(true)
                                 .setStyle(Discord.TextInputStyle.Short)
                                 .setValue(suggestion)
                           ]),
                        new Discord.ActionRowBuilder()
                           .setComponents([
                              new Discord.TextInputBuilder()
                                 .setCustomId(`description`)
                                 .setMaxLength(1024)
                                 .setLabel(`PART DESCRIPTION`)
                                 .setPlaceholder(`Describe what this part does.`)
                                 .setRequired(true)
                                 .setStyle(Discord.TextInputStyle.Paragraph)
                                 .setValue(partDescription)
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
                  .setColor(0x4de94c)
                  .setDescription(`**\`Sending Suggestion...\`**`)
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
            embeds:
               !partDescription
                  ? [
                     new Discord.EmbedBuilder()
                        .setColor(0x4de94c)
                        .setAuthor({
                           name: `${interaction.user.tag}\n(${interaction.user.id})`,
                           iconURL: interaction.user.displayAvatarURL()
                        })
                        .setDescription(suggestion)
                  ]
                  : [
                     new Discord.EmbedBuilder()
                        .setColor(0x4de94c)
                        .setAuthor({
                           name: `${interaction.user.tag}\n(${interaction.user.id})`,
                           iconURL: interaction.user.displayAvatarURL()
                        })
                        .setFields([
                           {
                              name: `PART NAME`,
                              value: suggestion
                           }, {
                              name: `PART DESCRIPTION`,
                              value: partDescription
                           }
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
                  .setColor(0x4de94c)
                  .setDescription(`**Your [suggestion](${message.url}) has been sent to ${message.channel}!**`)
            ]
         });

      };


   } catch {
      // the wait for a MessageComponentInteraction timed out
      // it's extremely unlikely that a user will see this after 24 hours
      // so the bot will just stop here and assume the message was dismissed
      return;
   };
};