import Discord from "discord.js";
import { colours, emojis, findSimilar, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * send the user's suggestion to its suggestion channel
 * @param {Discord.ButtonInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // button info
   const [ _button, type, id, fromDuplicateSuggestionWarning ] = interaction.customId.split(`:`);


   // function to try to fetch something or return undefined instead of throwing
   const tryOrUndefined = async promise => {
      try {
         return await promise;
      } catch {
         return undefined;
      };
   };


   // function to check if a user is in this guild
   const userIsInGuild = async userId => !!await tryOrUndefined(interaction.guild.members.fetch(userId));


   // function to create the preview text from a suggestion's content
   const createPreviewText = (content, length) => {
      const splitPreviewContent = content.replace(/[\n]+/g, ` `).split(` `);
      let previewContent = ``;

      for (const [ i, word ] of splitPreviewContent.entries()) {
         if (previewContent.trim().length + word.length >= length) {
            // limit the thread name to 50 characters without truncating a word
            previewContent = `${previewContent.trim() || word.slice(0, length)}...`;
            break;

         } else {
            // add this word the thread name
            previewContent += ` ${word}`;

            // this name can fit the whole of the thread's name
            if (i + 1 === splitPreviewContent.length)
               previewContent = previewContent.trim();
         };
      };

      return previewContent;
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


   // suggestion embed to send
   const embed = interaction.message.embeds[0];

   const contentOrPartName = embed.description || embed.fields[0].value;


   // boolean stuff for setting stuff in database
   const isPartSuggestion = type === `part-suggestions`;
   const hasImage = !!embed.image?.url;


   // "defer" the interaction
   await interaction.update({
      content: `Sending to ${channel}... ${emojis.loading}`,
      embeds: [
         embed
      ],
      components: []
   });


   // find duplicate suggestions
   const duplicateSuggestions = await (async () => {
      // get all suggestions for this type
      const suggestions = [];

      for await (const key of redis.scanIterator({ MATCH: `flooded-area:${type}:*` }))
         suggestions.push(await redis.HGETALL(key));

      // find similar suggestions
      return findSimilar(contentOrPartName, suggestions, {
         key: !isPartSuggestion ? `content` : `name`,
         limit: 3,
         minScore: 0.3
      })
         .map(result => result.object);
   })();


   // duplicate suggestions found and the duplicate suggestion warning hasn't showed yet
   if (duplicateSuggestions.length && fromDuplicateSuggestionWarning !== `true`)
      return await interaction.editReply({
         embeds: [
            embed,
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setTitle(`WAIT!`)
               .setDescription(strip`
                  This may be a **duplicate suggestion**.
                  Are you sure you still want to send it?

                  ${
                     (
                        await Promise.all(
                           duplicateSuggestions.map(async suggestion => strip`
                              **${await userIsInGuild(suggestion.suggester) ? Discord.userMention(suggestion.suggester) : (await interaction.client.users.fetch(suggestion.suggester)).tag} at ${Discord.time(Math.floor(suggestion[`created-timestamp`] / 1000))}**
                              > ${Discord.hyperlink(Discord.escapeMarkdown(createPreviewText(!isPartSuggestion ? suggestion.content : suggestion.name, 50)), suggestion[`message-url`], `${suggestion[`message-url`]} 🔗`)}
                              > ${[
                                    ...[ `approved`, `denied` ].includes(suggestion.status)
                                       ? [ `\`${suggestion.status === `approved` ? `Approved ✅` : `Denied ❎`}\`` ] : [],
                                    `\`${suggestion.deleted === `true` ? `Deleted 🗑️` : suggestion.locked === `true` ? `Locked 🔒` : `Not locked 🔓`}\``
                                 ]
                                    .join(`, `)
                              }
                              > ⬆️ ${suggestion.upvotes} | ${suggestion.downvotes} ⬇️
                           `)
                        )
                     )
                        .join(`\n\n`)
                  }
               `)
         ],
         components: [
            new Discord.ActionRowBuilder()
               .setComponents([
                  new Discord.ButtonBuilder()
                     .setCustomId(`edit-preview-suggestion:${type}:${id}`)
                     .setLabel(`Edit Suggestion`)
                     .setEmoji(`📝`)
                     .setStyle(Discord.ButtonStyle.Secondary),
                  new Discord.ButtonBuilder()
                     .setCustomId(`send-suggestion:${type}:${id}:true`)
                     .setLabel(`Send Suggestion`)
                     .setEmoji(`✅`)
                     .setStyle(Discord.ButtonStyle.Primary)
               ])
         ]
      });


   // send to the channel
   const suggestionMessage = await channel.send({
      embeds: [
         embed
      ]
   });


   // add the suggestion to the database
   await redis.HSET(`flooded-area:${type}:${suggestionMessage.id}`, {
      "id": suggestionMessage.id,
      "suggester": interaction.user.id,
      ...!isPartSuggestion
         ? {
            "content": embed.description
         }
         : {
            "name": embed.fields[0].value,
            "description": embed.fields[1].value
         },
      "created-timestamp": JSON.stringify(suggestionMessage.createdTimestamp),
      "last-updated-timestamp": JSON.stringify(suggestionMessage.createdTimestamp),

      ...hasImage
         ? {
            "image-url": embed.image.url
         }
         : {},
      "message-url": suggestionMessage.url,

      "status": `open for discussion`,
      "locked": JSON.stringify(false),
      "deleted": JSON.stringify(false),

      "upvotes": JSON.stringify(0),
      "upvoters": JSON.stringify([]),
      "downvotes": JSON.stringify(0),
      "downvoters": JSON.stringify([]),

      "edits": JSON.stringify([])
   });


   // add voting to the suggestion message
   await suggestionMessage.react(`⬆️`);
   await suggestionMessage.react(`⬇️`);


   // create the thread's name
   const suggestionOrPartName = !isPartSuggestion
      ? embed.description
      : embed.fields[0].value;

   const threadName = createPreviewText(suggestionOrPartName, 30);


   // create the thread for the suggestion message
   const suggestionThread = await suggestionMessage.startThread({
      name: threadName
   });


   // send the message containing settings to the thread
   await suggestionThread.send({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(0x4de94c)
            .setTitle(`\\#️⃣ Suggestion Discussions`)
            .setDescription(strip`
               **🎫 Status**
               > Open for discussion since ${Discord.time(Math.floor(suggestionThread.createdTimestamp / 1000), Discord.TimestampStyles.RelativeTime)}.

               **📝 Edits**
               > No edits to list.
            `)
      ],
      components: [
         new Discord.ActionRowBuilder()
            .setComponents([
               new Discord.ButtonBuilder()
                  .setCustomId(`edit-suggestion:${suggestionMessage.id}`)
                  .setLabel(`Edit Suggestion`)
                  .setEmoji(`📝`)
                  .setStyle(Discord.ButtonStyle.Secondary)
            ]),
         new Discord.ActionRowBuilder()
            .setComponents([
               new Discord.SelectMenuBuilder()
                  .setCustomId(`suggestion-settings:${suggestionMessage.id}`)
                  .setPlaceholder(`🔧 Suggestion Settings...`)
                  .setOptions([
                     new Discord.SelectMenuOptionBuilder()
                        .setLabel(`Approve Suggestion`)
                        .setDescription(`Set this suggestion's status as approved.`)
                        .setValue(`approve-suggestion`)
                        .setEmoji(`✅`),
                     new Discord.SelectMenuOptionBuilder()
                        .setLabel(`Deny Suggestion`)
                        .setDescription(`Set this suggestion's status as denied.`)
                        .setValue(`deny-suggestion`)
                        .setEmoji(`❎`),
                     new Discord.SelectMenuOptionBuilder()
                        .setLabel(`Lock Suggestion`)
                        .setDescription(`Lock this suggestion's votes.`)
                        .setValue(`lock-suggestion`)
                        .setEmoji(`🔒`),
                     new Discord.SelectMenuOptionBuilder()
                        .setLabel(`Delete Suggestion`)
                        .setDescription(`Removes this suggestion and deletes this thread.`)
                        .setValue(`delete-suggestion`)
                        .setEmoji(`🗑️`)
                  ])
            ])
      ]
   });


   // add the suggestion author to the thread
   await suggestionThread.members.add(interaction.member);


   // edit the reply to show that the suggestion was sent
   await interaction.editReply({
      content: `Sent to ${channel}! ✅`
   });
};