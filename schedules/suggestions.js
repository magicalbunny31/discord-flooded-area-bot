export const cron = {
   hour: 6,
   minute: 30
};


import Discord from "discord.js";
import { sendBotError, set, strip, wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {import("discord.js").Client} client
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (client, redis) => {
   // reaction enums
   const upvote   = `⬆️`;
   const downvote = `⬇️`;


   // function to try to fetch something or return undefined instead of throwing
   const tryOrUndefined = async promise => {
      try {
         return await promise;
      } catch {
         return undefined;
      };
   };


   // function to fetch all messages in a channel using snowflake ids pagination
   // https://discord.com/developers/docs/reference#snowflake-ids-in-pagination
   const fetchAllMessages = async channel => {
      const fetchedMessages = [];
      let lastMessage;

      while (true) {
         const messages = (await channel.messages.fetch({ limit: 100, ...fetchedMessages.length ? { before: fetchedMessages.at(-1).id } : {} }))
            .filter(message => message.author.id === client.user.id && !message.system);

         fetchedMessages.push(...messages.values());

         if (lastMessage?.id === fetchedMessages.at(-1).id)
            break;

         else
            lastMessage = fetchedMessages.at(-1);

         await wait(1000);
      };

      return fetchedMessages;
   };


   // loop each suggestion channel
   for (const suggestionChannelField of [
      `game-suggestions`, `server-suggestions`, `part-suggestions`
   ]) {


      // statistics
      const startTimestamp = Date.now();

      let falseSuggestionMessagesFetched = 0;

      let failedToFetchSuggestionMessages = 0;
      let failedToFetchSettingsMessages   = 0;

      let suggestionEmbedsEdited = 0;
      let settingsEmbedsEdited   = 0;


      // get messages in this suggestion channel
      const floodedAreaCommunity = `977254354589462618`;
      const guild = await client.guilds.fetch(floodedAreaCommunity);

      const suggestionChannelId = await redis.HGET(`flooded-area:channel:suggestions`, suggestionChannelField);
      const channel = await tryOrUndefined(guild.channels.fetch(suggestionChannelId));


      // function to check if a user is in this guild
      const userIsInGuild = async userId => !!await tryOrUndefined(guild.members.fetch(userId));


      // this channel doesn't exist
      if (!channel) {
         await sendBotError(
            `schedules/suggestions`,
            {
               url: process.env.WEBHOOK_ERRORS
            },
            new Error(`suggestionChannelField ${suggestionChannelField}'s channel not found in guild`)
         );

         continue;
      };


      // array of message ids (of suggestion messages) in this suggestion channel
      const suggestionMessageIds = (await fetchAllMessages(channel))
         .map(message => message.id);


      // loop each message id
      for (const id of suggestionMessageIds) {
         // get this suggestion from the database
         const suggestion = await redis.HGETALL(`flooded-area:${suggestionChannelField}:${id}`);


         // this isn't a suggestion
         if (!suggestion) {
            falseSuggestionMessagesFetched ++;

            continue;
         };


         // this suggestion is deleted
         if (suggestion.deleted === `true`)
            continue;


         // to try to not spam the api with requests, wait for five seconds
         await wait(5000);


         // get this suggestion message
         const suggestionMessage = await (async () => {
            try {
               // return the channel
               return await channel.messages.fetch(id);

            } catch (error) {
               // this message doesn't exist
               if (error.code === Discord.RESTJSONErrorCodes.UnknownMessage)
                  await redis
                     .multi()
                     .HSET(`flooded-area:${suggestionChannelField}:${id}`, {
                        deleted: JSON.stringify(true)
                     })
                     .HDEL(`flooded-area:${suggestionChannelField}:${id}`, `message-url`)
                     .exec();

               // return undefined, which will continue to the next id
               return undefined;
            };
         })();

         if (!suggestionMessage) {
            failedToFetchSuggestionMessages ++;

            continue;
         };


         // get this suggestion message's settings message
         const settingsMessage = await (async () => {
            if (!suggestionMessage.hasThread)
               return false;

            const thread = suggestionMessage.thread;
            const messages = await fetchAllMessages(thread);

            return messages
               .filter(message => message.author.id === client.user.id)
               .find(message => message.embeds[0]?.title === `\\#️⃣ Suggestion Discussions`);
         })();

         if (!settingsMessage) {
            failedToFetchSettingsMessages ++;

            continue;
         };


         // get votes info
         const upvotes   = await tryOrUndefined(suggestionMessage.reactions.cache.get(upvote)  .users.fetch());
         const downvotes = await tryOrUndefined(suggestionMessage.reactions.cache.get(downvote).users.fetch());

         const numberOfUpvotes   = (upvotes  ?.size || 1) - 1;
         const numberOfDownvotes = (downvotes?.size || 1) - 1;

         const upvoters   = upvotes  ?.map(user => user.id).filter(id => id !== client.user.id) || [];
         const downvoters = downvotes?.map(user => user.id).filter(id => id !== client.user.id) || [];


         // this suggestion's votes were removed
         if (!(upvotes || downvotes)) {
            await suggestionMessage.react(upvote);
            await suggestionMessage.react(downvote);
         };


         // update the database with these new values
         await redis.HSET(`flooded-area:${suggestionChannelField}:${id}`, {
            "upvotes":    JSON.stringify(numberOfUpvotes),
            "upvoters":   JSON.stringify(upvoters),
            "downvotes":  JSON.stringify(numberOfDownvotes),
            "downvoters": JSON.stringify(downvoters)
         });


         // find a colour based on the votes
         const cumulativeVotes = numberOfUpvotes - numberOfDownvotes;

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


         // get the suggester
         const suggester = await client.users.fetch(suggestion.suggester);
         const suggesterIsInGuild = await userIsInGuild(suggestion.suggester);


         // the suggestion is set as locked but the thread isn't, so unlock the suggestion
         const setAsLocked = suggestion.locked === `true`;
         const threadIsLocked = suggestionMessage.thread.locked;

         if (setAsLocked && !threadIsLocked) {
            await redis.HSET(`flooded-area:${suggestionChannelField}:${id}`, {
               "locked": JSON.stringify(false)
            });

            await suggestionMessage.thread.setLocked(false);
         };


         // the new suggestion embed
         const suggestionEmbed = new Discord.EmbedBuilder(suggestionMessage.embeds[0].data)
            .setColor(
               [ `approved`, `denied` ].includes(suggestion.status)
                  ? suggestion.status === `approved` ? 0x4de94c : 0xf60000
                  : colour
            )
            .setAuthor({ // if the suggester isn't in this guild anymore, we'll respect their privacy and use their default avatar
               name: suggester.tag, // can't use last known username#discriminator because viewing edits will expose their real username#discriminator
               iconURL: suggesterIsInGuild ? suggester.displayAvatarURL() : suggester.defaultAvatarURL
            })
            .setFooter({
               text: [
                  ...cumulativeVotes >= 10
                     ? [ `🎉` ] : [],
                  ...[ `approved`, `denied` ].includes(suggestion.status)
                     ? [ suggestion.status === `approved` ? `✅` : `❎` ] : [],
                  ...((setAsLocked && !threadIsLocked) ? false : suggestion.locked === `true`)
                     ? [ `🔒` ] : []
               ]
                  .join(``)
               || null
            });


         // update the suggestion message if the embeds are different
         // this has to be checked manually because of proxy_icon_url
         const suggestionEmbedsEqual = suggestionMessage.embeds[0].color                 === suggestionEmbed.data.color
            &&                         suggestionMessage.embeds[0].author?.name          === suggestionEmbed.data.author.name
            &&                         suggestionMessage.embeds[0].author?.iconURL       === suggestionEmbed.data.author.icon_url
            &&                        (suggestionMessage.embeds[0].footer?.text || null) === suggestionEmbed.data.footer.text; // suggestionMessage.embeds[0].footer?.text could be undefined

         if (!suggestionEmbedsEqual) {
            suggestionEmbedsEdited ++;

            await suggestionMessage.edit({
               embeds: [
                  suggestionEmbed
               ]
            });
         };


         // the new settings embed
         const toHuman = array => array.concat(array.splice(-2, 2).join(` and `)).join(`, `);

         const edits = JSON.parse(suggestion.edits);
         const editors = set(edits.map(edit => Discord.userMention(edit.editor)));
         const lastEdit = edits.at(-1);

         const settingsEmbed = new Discord.EmbedBuilder(settingsMessage.embeds[0].data)
            .setDescription(strip`
               **${
                  suggestion.status === `open for discussion`
                     ? `💬`
                     : suggestion.status === `approved`
                        ? `✅`
                        : `❎`
               } Status**
               ${
                  [ `approved`, `denied` ].includes(suggestion.status)
                     ? strip`
                        > ${suggestion.status === `approved` ? `Approved` : `Denied`} by ${Discord.userMention(suggestion[`status-changer`])} ${Discord.time(Math.floor(+suggestion[`last-updated-timestamp`] / 1000), Discord.TimestampStyles.RelativeTime)}.
                        > \`${suggestion[`status-reason`]}\`
                     `
                     : `> Open for discussion since ${Discord.time(Math.floor(+suggestion[`last-updated-timestamp`] / 1000), Discord.TimestampStyles.RelativeTime)}.`
               }

               **✏️ Editors**
               ${
                  edits.length
                     ? strip`
                        > Edited by ${toHuman(editors)}.
                        > Last edited by ${Discord.userMention(lastEdit.editor)} ${Discord.time(Math.floor(lastEdit[`created-timestamp`] / 1000), Discord.TimestampStyles.RelativeTime)}
                     `
                     : `> **\`No edits to list.\`**`
               }
            `);


         // the new settings message's components
         const components = [
            new Discord.ActionRowBuilder()
               .setComponents([
                  new Discord.ButtonBuilder()
                     .setCustomId(`edit-suggestion:${id}`)
                     .setLabel(`Edit Suggestion`)
                     .setEmoji(`📝`)
                     .setStyle(Discord.ButtonStyle.Secondary),
                  new Discord.ButtonBuilder()
                     .setCustomId(`view-edits:${id}`)
                     .setLabel(`View Edits`)
                     .setEmoji(`📃`)
                     .setStyle(Discord.ButtonStyle.Secondary)
                     .setDisabled(!edits.length)
               ]),

            new Discord.ActionRowBuilder()
               .setComponents([
                  new Discord.SelectMenuBuilder()
                     .setCustomId(`suggestion-settings:${id}`)
                     .setPlaceholder(`Suggestion Settings...`)
                     .setOptions([
                        new Discord.SelectMenuOptionBuilder()
                           .setLabel(`Change Status`)
                           .setDescription(`Change this suggestion's status and lock votes.`)
                           .setValue(`change-status`)
                           .setEmoji(`🎫`),
                        new Discord.SelectMenuOptionBuilder()
                           .setLabel(`Lock Suggestion`)
                           .setDescription(`Lock votes and this thread.`)
                           .setValue(`lock-suggestion`)
                           .setEmoji(`🔒`),
                        new Discord.SelectMenuOptionBuilder()
                           .setLabel(`Delete Suggestion`)
                           .setDescription(`Delete this suggestion and this thread.`)
                           .setValue(`delete-suggestion`)
                           .setEmoji(`🗑️`)
                     ])
               ])
         ];


         // update the settings message if the embeds are different
         const settingsEmbedsEqual = settingsMessage.embeds[0].equals(settingsEmbed.data);

         if (!settingsEmbedsEqual) {
            settingsEmbedsEdited ++;

            const threadArchived = suggestionMessage.thread.archived;

            if (threadArchived)
               await suggestionMessage.thread.setArchived(false);

            await settingsMessage.edit({
               embeds: [
                  settingsEmbed
               ],
               components
            });

            if (threadArchived)
               await suggestionMessage.thread.setArchived(true);
         };
      };


      // set statistics in database
      await redis.HSET(`flooded-area:command:bun-stuff_suggestions-schedule-stats`, {
         [suggestionChannelField]: JSON.stringify({
            startTimestamp,
            endTimestamp: Date.now(),

            suggestionsMessagesFetched: suggestionMessageIds.length,
            falseSuggestionMessagesFetched,

            failedToFetchSuggestionMessages,
            failedToFetchSettingsMessages,

            suggestionEmbedsEdited,
            settingsEmbedsEdited
         })
      });
   };
};