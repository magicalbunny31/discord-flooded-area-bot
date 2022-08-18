import Discord from "discord.js";

import pkg from "../../package.json" assert { type: "json" };

import { colours, emojis } from "@magicalbunny31/awesome-utility-stuff";

/**
 * confirm the user's suggestion before sending
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // modal info
   const [ _modal, type, isSending ] = interaction.customId.split(`:`);


   // "defer" the interaction (http requests timings are unpredictable)
   // if true  : reply to the interaction if it originated from the starting select menu
   // if false : update the message if this was from a modal to edit the suggestion before sending
   const sendEphemeralResponse = !interaction.message.webhookId;

   if (sendEphemeralResponse)
      await interaction.deferReply({
         ephemeral: true
      });

   else {
      // disable this message's previous components
      for (const actionRow of interaction.message.components)
         for (const components of actionRow.components)
            components.data.disabled = true;

      // update the message
      await interaction.update({
         embeds: [
            ...interaction.message.embeds,
            new Discord.EmbedBuilder()
               .setColor(0x4de94c)
               .setDescription(`**\`Editing suggestion..\`** ${emojis.loading}`)
         ],
         components: interaction.message.components
      });
   };


   // function to try to fetch something or return null instead of throwing
   const tryOrUndefined = async promise => {
      try {
         return await promise;
      } catch {
         return undefined;
      };
   };


   // function to check if a url leads to an image
   const urlLeadsToImage = async url => {
      try {
         // send a HEAD request to this url
         const response = await fetch(url, {
            method: `HEAD`,
            headers: {
               "User-Agent": `${pkg.name} (https://github.com/magicalbunny31/discord-flooded-area-bot)`
            },
            signal: AbortSignal.timeout(5000)
         });

         // check its headers
         if (response.headers.get(`Content-Type`).startsWith(`image`))
            return true;
         else
            return false;

      } catch (error) {
         // url timed out or not a valid url
         return false;
      };
   };


   // get the channel to send this suggestion to
   const channelId = await redis.HGET(`flooded-area:channel:suggestions`, type);
   const channel = await tryOrUndefined(interaction.guild.channels.fetch(channelId));


   // channel doesn't exist in guild
   if (!channel)
      return await interaction.editReply({
         content: strip`
            ❌ **Can't fetch the channel to send this suggestion to.**
            > Consider contacting a member of the ${Discord.roleMention(`989125486590451732`)} or try again later.
         `,
         embeds: [],
         components: []
      });


   // depending on the modal, it'll have multiple fields (note: these variables actually have to be null)
   const suggestionOrPartName         = interaction.components[0] .components[0].value;         // suggestions for game/server  /  name        for part  /  news board
   const imageOrPartDescriptionOrNull = interaction.components[1]?.components[0].value || null; // image       for game/server  /  description for part
   const partImageOrNull              = interaction.components[2]?.components[0].value || null; //                                 image       for part

   const isPartSuggestion = interaction.fields.fields.has(`name`);
   const isNewsBoardSuggestion = interaction.fields.fields.has(`text`);
   const hasImage = !!(!isPartSuggestion ? imageOrPartDescriptionOrNull : partImageOrNull);
   const isImageURL = hasImage
      ? !isPartSuggestion
         ? await urlLeadsToImage(imageOrPartDescriptionOrNull)
         : await urlLeadsToImage(partImageOrNull)
      : true;


   // temporarily set these values in the database in case they'll be edited again
   await redis
      .multi()
      .HSET(`flooded-area:temporary-stuff:${interaction.id}`, {
         suggestionOrPartName:         suggestionOrPartName.trim(),
         imageOrPartDescriptionOrNull: imageOrPartDescriptionOrNull?.trim() || ``,
         partImageOrNull:              partImageOrNull?.trim()              || ``
      })
      .EXPIRE(`flooded-area:temporary-stuff:${interaction.id}`, 86400)
      .exec();


   // get some fields from this suggestion
   const suggestionId = interaction.channel.id;
   const [ upvotes, downvotes, ...suggestion ] = await redis.HMGET(`flooded-area:${type}:${suggestionId}`, [ `upvotes`, `downvotes`, ...[ ...!isPartSuggestion ? [ `content` ] : [ `name`, `description` ], `image-url` ] ]);


   // find a colour based on the current votes
   const cumulativeVotes = +upvotes - +downvotes;

   const colour = (() => {
      const positiveColours = [ 0xfaee00, 0xedef00, 0xd8ef04, 0xc0ee16, 0xa5ee26, 0x88ec35, 0x6deb41, 0x57e949, 0x4de94c ];
      const neutralColour   =   0xffee00;
      const negativeColours = [ 0xffe800, 0xffd800, 0xffc100, 0xffa400, 0xff8400, 0xff6300, 0xfc4100, 0xf81e00, 0xf60000 ];

      return cumulativeVotes === 0
         ? neutralColour
         : cumulativeVotes > 0
            ? positiveColours[         cumulativeVotes ] || positiveColours[8]
            : negativeColours[Math.abs(cumulativeVotes)] || negativeColours[8];
   })();


   // embeds
   const isDuplicate = !isPartSuggestion
      ? suggestionOrPartName.trim() === suggestion[0] && (imageOrPartDescriptionOrNull?.trim() || null) === suggestion[1]
      : suggestionOrPartName.trim() === suggestion[0] && (imageOrPartDescriptionOrNull?.trim() || null) === suggestion[1] && (partImageOrNull?.trim() || null) === suggestion[2];

   const embeds = [
      ...isNewsBoardSuggestion
         ? [
            new Discord.EmbedBuilder()
               .setColor(isSending === `true` ? 0xffee00 : colour)
               .setAuthor({
                  name: interaction.user.tag,
                  iconURL: interaction.user.displayAvatarURL()
               })
               .setDescription(suggestionOrPartName.trim() || `**\`You must enter a suggestion.\`**`)
         ]
         : !isPartSuggestion
            ? isImageURL
               ? [
                  new Discord.EmbedBuilder()
                     .setColor(isSending === `true` ? 0xffee00 : colour)
                     .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.displayAvatarURL()
                     })
                     .setDescription(suggestionOrPartName.trim() || `**\`You must enter a suggestion.\`**`)
                     .setImage(imageOrPartDescriptionOrNull)
               ]
               : [
                  new Discord.EmbedBuilder()
                     .setColor(isSending === `true` ? 0xffee00 : colour)
                     .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.displayAvatarURL()
                     })
                     .setDescription(suggestionOrPartName.trim() || `**\`You must enter a suggestion.\`**`)
                     .setFields([
                        {
                           name: `IMAGE`,
                           value: `**\`You must enter a valid image URL.\`**`
                        }
                     ])
               ]
            : isImageURL
               ? [
                  new Discord.EmbedBuilder()
                     .setColor(isSending === `true` ? 0xffee00 : colour)
                     .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.displayAvatarURL()
                     })
                     .setFields(
                        [{
                           name: `PART NAME`,
                           value: suggestionOrPartName.trim() || `**\`You must enter a name.\`**`
                        }, {
                           name: `PART DESCRIPTION`,
                           value: imageOrPartDescriptionOrNull.trim() || `**\`You must enter a description.\`**`
                        }]
                     )
                     .setImage(partImageOrNull)
               ]
               : [
                  new Discord.EmbedBuilder()
                     .setColor(isSending === `true` ? 0xffee00 : colour)
                     .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.displayAvatarURL()
                     })
                     .setFields([
                        {
                           name: `PART NAME`,
                           value: suggestionOrPartName.trim() || `**\`You must enter a name.\`**`
                        }, {
                           name: `PART DESCRIPTION`,
                           value: imageOrPartDescriptionOrNull.trim() || `**\`You must enter a description.\`**`
                        }, {
                           name: `IMAGE`,
                           value: `**\`You must enter a valid image URL.\`**`
                        }
                     ])
               ],

      ...isDuplicate
         ? [
            new Discord.EmbedBuilder()
               .setColor(colours.red)
               .setDescription(`**\`This edit is identical to the current suggestion.\`**`)
         ]
         : []
   ];


   // components
   const isInvalid = !suggestionOrPartName.trim() || (isPartSuggestion && !imageOrPartDescriptionOrNull?.trim()) || !isImageURL || (isSending === `false` && isDuplicate);

   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`edit-preview-suggestion:${type}:${interaction.id}:${isSending}`)
               .setLabel(`Edit Suggestion`)
               .setEmoji(`📝`)
               .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
               .setCustomId(
                  isSending === `true`
                     ? `send-suggestion:${type}:${interaction.id}:false`
                     : `confirm-edits:${type}`
               )
               .setLabel(
                  isSending === `true`
                     ? `Send Suggestion`
                     : `Confirm Edits`
               )
               .setEmoji(`✅`)
               .setStyle(Discord.ButtonStyle.Success)
               .setDisabled(!!isInvalid)
         ])
   ];


   // edit the interaction's original reply
   const suggestionMessage = await interaction.channel.fetchStarterMessage?.();

   return await interaction.editReply({
      content: `${isSending === `true` ? `Sending to ${channel}` : `Editing ${Discord.hyperlink(`suggestion`, suggestionMessage?.url, `${suggestionMessage?.url} 🔗`)}`}...`,
      embeds,
      components
   });
};