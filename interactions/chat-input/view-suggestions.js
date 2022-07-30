import Discord from "discord.js";
import fuzzysort from "fuzzysort";

import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * bulk-view suggestions
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
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
   const createPreviewText = content => {
      const maxLength = 50;
      const splitPreviewContent = content.replace(/[\n]+/g, ` `).split(` `);
      let previewContent = ``;

      for (const [ i, word ] of splitPreviewContent.entries()) {
         if (previewContent.trim().length + word.length >= maxLength) {
            // limit the thread name to 50 characters without truncating a word
            previewContent = `${previewContent.trim() || word.slice(0, maxLength)}...`;
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


   // function to get a colour based on votes
   const getColour = (upvotes, downvotes) => {
      const cumulativeVotes = upvotes - downvotes;

      const positiveColours = [ 0xfaee00, 0xedef00, 0xd8ef04, 0xc0ee16, 0xa5ee26, 0x88ec35, 0x6deb41, 0x57e949, 0x4de94c ];
      const neutralColour   =   0xffee00;
      const negativeColours = [ 0xffe800, 0xffd800, 0xffc100, 0xffa400, 0xff8400, 0xff6300, 0xfc4100, 0xf81e00, 0xf60000 ];

      return cumulativeVotes === 0
         ? neutralColour
         : cumulativeVotes > 0
            ? positiveColours[         cumulativeVotes ] || positiveColours[8]
            : negativeColours[Math.abs(cumulativeVotes)] || negativeColours[8];
   };


   // options
   const suggestionChannelOption = interaction.options.getString(`suggestion-channel`);
   const suggestionChannelId = await redis.HGET(`flooded-area:channels:suggestions`, suggestionChannelOption);
   const suggestionChannel = await tryOrUndefined(interaction.guild.channels.fetch(suggestionChannelId));

   const suggester = interaction.options.getUser(`suggester`);
   const suggesterId = suggester?.id;

   const content = interaction.options.getString(`content`);

   const createdBeforeDate = interaction.options.getInteger(`created-before-date`);

   const createdAfterDate = interaction.options.getInteger(`created-after-date`);

   const status = interaction.options.getString(`status`);

   const isLocked = interaction.options.getString(`is-locked`);
   const viewBothLocked = isLocked === `both`;

   const isDeleted = interaction.options.getString(`is-deleted`);
   const viewBothDeleted = isDeleted === `both`;

   const minimumOverallVote = interaction.options.getInteger(`minimum-overall-vote`);

   const maximumOverallVote = interaction.options.getInteger(`maximum-overall-vote`);


   // channel doesn't exist in guild
   if (!suggestionChannel)
      return await interaction.reply({
         content: strip`
            ❌ **Can't fetch the suggestion channel \`${suggestionChannelOption}\`**
            > Use the command ${emojis.flooded_area} **/set-channel suggestions** to set a new suggestion channel.
         `,
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // get all suggestions for this suggestion channel
   let suggestions = await (async () => {
      const suggestions = [];

      for await (const key of redis.scanIterator({ MATCH: `flooded-area:${suggestionChannelOption}:*` }))
         suggestions.push(await redis.HGETALL(key));

      return suggestions;
   })();


   // view suggestions from this user
   if (suggesterId)
      suggestions = suggestions.filter(suggestion => suggestion.suggester === suggesterId).slice().reverse();


   // fuzzy search for suggestions that may match this content
   const isPartSuggestion = suggestionChannelOption === `part-suggestions`;

   if (content)
      suggestions = fuzzysort
         .go(content, suggestions, {
            key: !isPartSuggestion ? `content` : `name`
         })
         .map(result => result.obj);


   // TODO created-before-date
   // TODO created-after-date


   // status of the suggestions to view
   if (status)
      suggestions = suggestions.filter(suggestion => suggestion.status === status);


   // view locked suggestions?
   if (!viewBothLocked && isLocked)
      suggestions = suggestions.filter(suggestion => suggestion.locked === isLocked);


   // view deleted suggestions?
   if (!viewBothDeleted && isDeleted)
      suggestions = suggestions.filter(suggestion => suggestion.deleted === isDeleted);


   // view suggestions with an overall vote greater than or equal to this value
   if (Number.isInteger(minimumOverallVote))
      suggestions = suggestions.filter(suggestion => +suggestion.upvotes - +suggestion.downvotes >= minimumOverallVote);


   // view suggestions with an overall vote less than or equal to this value
   if (Number.isInteger(maximumOverallVote))
      suggestions = suggestions.filter(suggestion => +suggestion.upvotes - +suggestion.downvotes <= maximumOverallVote);


   // sort the suggestions array by their created-timestamp
   suggestions = suggestions.sort((a, b) => +b[`created-timestamp`] - +a[`created-timestamp`]);


   // split the suggestions array into chunks of 5
   const size = 5;
   suggestions = Array.from(
      new Array(Math.ceil(suggestions.length / size)),
      (_element, i) => suggestions.slice(i * size, i * size + size)
   );


   // temporarily set the suggestions array in the database in order for the menu to work
   if (suggestions.length)
      await redis
         .multi()
         .RPUSH(`flooded-area:temporary-stuff:${interaction.id}`, suggestions.map(suggestion => JSON.stringify(suggestion)))
         .EXPIRE(`flooded-area:temporary-stuff:${interaction.id}`, 86400)
         .exec();


   // embeds
   const embeds = suggestions.length
      ? await Promise.all(
         suggestions[0].map(async suggestion =>
            new Discord.EmbedBuilder()
               .setColor(
                  [ `approved`, `denied` ].includes(suggestion.status)
                     ? suggestion.status === `approved` ? 0x4de94c : 0xf60000
                     : getColour(+suggestion.upvotes, +suggestion.downvotes)
               )
               .setDescription(strip`
                  **${await userIsInGuild(suggestion.suggester) ? Discord.userMention(suggestion.suggester) : (await interaction.client.users.fetch(suggestion.suggester)).tag} at ${Discord.time(Math.floor(suggestion[`created-timestamp`] / 1000))}**
                  > ${Discord.hyperlink(Discord.escapeMarkdown(createPreviewText(!isPartSuggestion ? suggestion.content : suggestion.name)), suggestion[`message-url`], `${suggestion[`message-url`]} 🔗`)}
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
      : [
         new Discord.EmbedBuilder()
            .setColor(0xf60000)
            .setDescription(`❌ **No suggestions matched the filters provided.**`)
      ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.SelectMenuBuilder()
               .setCustomId(`view-suggestions:${suggestionChannelOption}:${interaction.id}:0`)
               .setPlaceholder(`Select a suggestion to view more on...`)
               .setOptions(
                  suggestions.length
                     ? await Promise.all(
                        suggestions[0].map(async suggestion =>
                           new Discord.SelectMenuOptionBuilder()
                              .setLabel(createPreviewText(!isPartSuggestion ? suggestion.content : suggestion.name))
                              .setDescription((await interaction.client.users.fetch(suggestion.suggester)).tag)
                              .setValue(suggestion.id)
                              .setEmoji(`💬`)
                        )
                     )
                     : [
                        new Discord.SelectMenuOptionBuilder()
                           .setLabel(`owo`)
                           .setDescription(`hey! you're not supposed to see this! *bap*`)
                           .setValue(`owo`)
                     ]
               )
               .setDisabled(!suggestions.length)
         ]),

      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`view-suggestions:${suggestionChannelOption}:${interaction.id}:deez-nuts`) // message component custom ids can't be duplicated, this button is completely cosmetic here
               .setEmoji(`⬅️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(true),
            new Discord.ButtonBuilder()
               .setCustomId(`view-suggestions:${suggestionChannelOption}:${interaction.id}:1`)
               .setEmoji(`➡️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(suggestions.length <= 1),
            new Discord.ButtonBuilder()
               .setCustomId(`this button shows the pages, that's it`)
               .setLabel(`1 / ${suggestions.length || 1}`)
               .setStyle(Discord.ButtonStyle.Secondary)
               .setDisabled(true)
         ])
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds,
      components
   });
};