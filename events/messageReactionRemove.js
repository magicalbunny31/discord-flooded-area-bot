export const name = Discord.Events.MessageReactionRemove;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.MessageReaction} messageReaction
 * @param {Discord.User} user
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (messageReaction, user, firestore) => {
   // function to try to fetch something or return undefined instead of throwing
   const tryOrUndefined = async promise => {
      try {
         return await promise;
      } catch {
         return undefined;
      };
   };


   // ignore reactions that aren't downvotes or custom emojis
   const bannedEmojis = [ `⬇️`, `❌`, `⛔`, `🚫`, `⏬`, `⤵️`, `👇`, `👎`, `📉`, `🔽`, `🤬` ];

   if (bannedEmojis.includes(messageReaction.emoji.name) || messageReaction.emoji.id)
      return;


   // some variables that are guaranteed to exist due to partials
   // https://discord.com/developers/docs/topics/gateway#message-reaction-add
   const channelId = messageReaction.message.channel.parent?.id;


   // ignore bot reactions
   if (user.bot)
      return;


   // only listen for reactions in the suggestion channels
   if (![ process.env.CHANNEL_GAME_SUGGESTIONS, process.env.CHANNEL_SERVER_SUGGESTIONS, process.env.CHANNEL_PART_SUGGESTIONS ].includes(channelId))
      return;


   // the post was made by a bot, don't edit its tags
   const starterMessage = await tryOrUndefined(messageReaction.message.channel.fetchStarterMessage());

   if (starterMessage?.author.bot)
      return;


   // this suggestion's highest reaction emoji has under 10 votes but the forum post has the popular tag
   const highestMessageReactionCount = messageReaction.message.reactions.cache
      .filter(messageReaction => !bannedEmojis.includes(messageReaction.emoji.name))
      .sort((a, b) => a.count - b.count)
      .at(-1)
      ?.count;

   const popularTag = messageReaction.message.channel.parent.availableTags.find(tag => tag.name === `[ POPULAR ]`).id;
   const popularTagIndex = messageReaction.message.channel.appliedTags.findIndex(id => id === popularTag);

   if (popularTagIndex > 0)
      messageReaction.message.channel.appliedTags.splice(popularTagIndex, 1);

   if (highestMessageReactionCount < 10)
      await messageReaction.message.channel.setAppliedTags([ ...messageReaction.message.channel.appliedTags ]);
};