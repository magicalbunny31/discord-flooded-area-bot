import Discord from "discord.js";
import { strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * edit the user's suggestion before sending
 * @param {Discord.ButtonInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // button info
   const [ _button, id ] = interaction.customId.split(`:`);


   // what type of suggestion this suggestion is exactly
   const rawChannelIds = await redis.HGETALL(`flooded-area:channel:suggestions`);

   const channelTypes = Object.fromEntries(Object.entries(rawChannelIds).map(id => id.reverse())); // reverse the object's keys with its values
   const type         = channelTypes[interaction.channel.parent.id];                               // use the channel id to find the object's key (the suggestion type)
   const suggestion   = await redis.HGETALL(`flooded-area:${type}:${id}`);                         // fetch this suggestion from the database


   // only the suggester or moderation team can edit suggestions
   const isSuggester = suggestion.suggester === interaction.user.id;

   const moderationTeam = await redis.GET(`flooded-area:role:moderation-team`);
   const isModerationTeam = interaction.member.roles.cache.has(moderationTeam);

   if (!(isSuggester || isModerationTeam))
      return await interaction.reply({
         content: strip`
            ❌ **Cannot edit this suggestion.**
            > Only the suggester ${Discord.userMention(suggestion.suggester)} or the ${Discord.roleMention(moderationTeam)} can edit this suggestion.
         `,
         allowedMentions: {
            parse: []
         },
         ephemeral: true
      });


   // can't edit locked or approved/denied suggestions if not staff
   const locked = suggestion.locked === `true`;
   const approvedOrDenied = [ `approved`, `denied` ].includes(suggestion.status);

   if ((locked || approvedOrDenied) && !isModerationTeam)
      return await interaction.reply({
         content: strip`
            ❌ **Cannot edit this suggestion.**
            > Your suggestion ${locked ? `is locked` : `has been ${suggestion.status}`}.
            > Only the ${Discord.roleMention(moderationTeam)} will be able to edit your suggestion further.
         `,
         allowedMentions: {
            parse: []
         },
         ephemeral: true
      });


   // depending on the modal, it'll have multiple fields (note: these variables actually have to be null)
   const suggestionOrPartName         = suggestion.content     || suggestion.name;                                           // suggestions for game/server  /  name        for part
   const imageOrPartDescriptionOrNull =                           suggestion.description || suggestion[`image-url`] || null; // image       for game/server  /  description for part
   const partImageOrNull              =                                                     suggestion[`image-url`] || null; //                                 image       for part


   // send the correct modal for each suggestion type
   switch (type) {


      /**
       * suggest a new feature for flooded area on roblox
       */
      case `game-suggestions`: {
         // show modal
         return await interaction.showModal(
            new Discord.ModalBuilder()
               .setCustomId(`edit-suggestion:${type}`)
               .setTitle(`Edit Game Suggestion`)
               .setComponents([
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`suggestion`)
                           .setLabel(`YOUR SUGGESTION`)
                           .setPlaceholder(`🎮 What is your suggestion for the game?`)
                           .setValue(suggestionOrPartName)
                           .setRequired(true)
                           .setStyle(Discord.TextInputStyle.Paragraph)
                     ]),
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`image`)
                           .setMaxLength(2048)
                           .setLabel(`IMAGE`)
                           .setPlaceholder(`🔗 Add an optional image url to show.`)
                           .setValue(imageOrPartDescriptionOrNull || ``)
                           .setRequired(false)
                           .setStyle(Discord.TextInputStyle.Short)
                     ])
               ])
         );
      };


      /**
       * suggest an idea for this discord server
       */
      case `server-suggestions`: {
         // show modal
         return await interaction.showModal(
            new Discord.ModalBuilder()
               .setCustomId(`edit-suggestion:${type}`)
               .setTitle(`Edit Server Suggestion`)
               .setComponents([
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`suggestion`)
                           .setLabel(`YOUR SUGGESTION`)
                           .setPlaceholder(`📂 What is your suggestion for the server?`)
                           .setValue(suggestionOrPartName)
                           .setRequired(true)
                           .setStyle(Discord.TextInputStyle.Paragraph)
                     ]),
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`image`)
                           .setMaxLength(2048)
                           .setLabel(`IMAGE`)
                           .setPlaceholder(`🔗 Add an optional image url to show.`)
                           .setValue(imageOrPartDescriptionOrNull || ``)
                           .setRequired(false)
                           .setStyle(Discord.TextInputStyle.Short)
                     ])
               ])
         );
      };


      /**
       * suggest a new part for flooded area on roblox
       */
      case `part-suggestions`: {
         // show modal
         return await interaction.showModal(
            new Discord.ModalBuilder()
               .setCustomId(`edit-suggestion:${type}`)
               .setTitle(`Edit Part Suggestion`)
               .setComponents([
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`name`)
                           .setMaxLength(1024)
                           .setLabel(`PART NAME`)
                           .setPlaceholder(`🏷️ What is this part's name?`)
                           .setValue(suggestionOrPartName)
                           .setRequired(true)
                           .setStyle(Discord.TextInputStyle.Short)
                     ]),
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`description`)
                           .setMaxLength(1024)
                           .setLabel(`PART DESCRIPTION`)
                           .setPlaceholder(`🧱 Describe what this part does.`)
                           .setValue(imageOrPartDescriptionOrNull || ``)
                           .setRequired(true)
                           .setStyle(Discord.TextInputStyle.Paragraph)
                     ]),
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`image`)
                           .setMaxLength(2048)
                           .setLabel(`IMAGE`)
                           .setPlaceholder(`🔗 Add an optional image url to show.`)
                           .setValue(partImageOrNull || ``)
                           .setRequired(false)
                           .setStyle(Discord.TextInputStyle.Short)
                     ])
               ])
         );
      };


      /**
       * suggestions for a new part for flooded are on roblox
       */
      case `news-board-suggestions`: {
         // show modal
         return await interaction.showModal(
            new Discord.ModalBuilder()
               .setCustomId(`edit-suggestion:${type}`)
               .setTitle(`Edit News Board Suggestion`)
               .setComponents([
                  new Discord.ActionRowBuilder()
                     .setComponents([
                        new Discord.TextInputBuilder()
                           .setCustomId(`text`)
                           .setMaxLength(256)
                           .setLabel(`TEXT`)
                           .setPlaceholder(`📰 What text should be displayed on the news board?`)
                           .setValue(suggestionOrPartName)
                           .setRequired(true)
                           .setStyle(Discord.TextInputStyle.Paragraph)
                     ])
               ])
         );
      };


   };
};