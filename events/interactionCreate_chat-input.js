export const name = `interactionCreate`;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Interaction} interaction
 */
export default async interaction => {
   // this file is for ChatInputCommandInteractions
   if (!interaction.isChatInputCommand())
      return;


   // this user is banned from making suggestions
   const suggestionsBannedRoleId = `979489114153963560`;
   const reactionMemberIsSuggestionsBanned = interaction.member.roles.cache.has(suggestionsBannedRoleId);

   if (reactionMemberIsSuggestionsBanned)
      return await interaction.reply({
         content: `You are banned from making suggestions.`,
         ephemeral: true
      });


   // get this command and the suggestion-message-id
   const command = interaction.commandName;
   const messageId = interaction.options.getString(`suggestion-message-id`);


   // ids of the channels for each suggestion type
   const channelIds = {
      game:   `983391293583523881`,
      server: `983391792131108885`,
      part:   `983391983487815791`
   };


   // function to circumvent a 404 error through try/catch
   // yes, i know it might not be the *best* idea but it's the best we've got, chef
   const tryFetchMessage = async key => {
      try {
         return [ await (await interaction.guild.channels.fetch(channelIds[key])).messages.fetch(messageId), key ];
      } catch {
         return [];
      };
   };


   // get this suggestion-message-id's message
   const [ message, type ] = [
      ...await tryFetchMessage(`game`),
      ...await tryFetchMessage(`server`),
      ...await tryFetchMessage(`part`)
   ];


   // this message doesn't exist
   if (!message)
      return await interaction.reply({
         content: `**\`A suggestion with the supplied ID doesn't exist.\`**`,
         ephemeral: true
      });


   // this user isn't the author of this suggestion
   if (message.embeds[0].data.author.name.match(/\([^()]*\)/g)?.pop().slice(1, -1) !== interaction.user.id)
      return await interaction.reply({
         content: `**\`You can only edit or delete your own suggestions.\`**`,
         ephemeral: true
      });


   // commands
   switch (command) {


      case `delete-suggestion`:
         // send a message to confirm deletion
         return await interaction.reply({
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(interaction.user.accentColor || (await interaction.user.fetch(true)).accentColor)
                  .setDescription(`**Are you sure you want to delete your [suggestion](${message.url}) in ${Discord.Formatters.channelMention(channelIds[type])}?**`)
            ],
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents([
                     new Discord.ButtonBuilder()
                        .setCustomId(`delete-suggestion:${channelIds[type]}:${message.id}`)
                        .setStyle(Discord.ButtonStyle.Danger)
                        .setEmoji(`💣`)
                        .setLabel(`Delete Suggestion`)
                  ])
            ],
            ephemeral: true
         });


      case `edit-suggestion`:
         // get the fields of this suggestion
         const [ embed ] = message.embeds;

         const isPartSuggestion = type === `part`;

         const suggestionOrName             = !isPartSuggestion ? embed.data.description : embed.data.fields[0].value;         // suggestions for game/server  /  name        for part
         const imageOrNullOrPartDescription = !isPartSuggestion ? embed.data.image?.url  : embed.data.fields[1].value || null; // image       for game/server  /  description for part
         const partImageOrNull              = !isPartSuggestion ? null                   : embed.data.image?.url      || null; //                                 image       for part


         // respond to the interaction with a modal for each suggestion type
         switch (type) {


            case `game`:
               return await interaction.showModal(
                  new Discord.ModalBuilder()
                     .setCustomId(`edit-suggestion:game:${channelIds[type]}:${message.id}`)
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
               return await interaction.showModal(
                  new Discord.ModalBuilder()
                     .setCustomId(`edit-suggestion:server:${channelIds[type]}:${message.id}`)
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
               return await interaction.showModal(
                  new Discord.ModalBuilder()
                     .setCustomId(`edit-suggestion:part:${channelIds[type]}:${message.id}`)
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
   };
};