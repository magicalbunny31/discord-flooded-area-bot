export const name = Discord.Events.MessageReactionRemove;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.MessageReaction} messageReaction
 * @param {Discord.User} user
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (messageReaction, user, firestore) => {
   // reaction enums
   const upvote = `⬆️`;


   // ignore reactions that aren't votes
   if (![ upvote ].includes(messageReaction.emoji.name))
      return;


   // some variables that are guaranteed to exist due to partials
   // https://discord.com/developers/docs/topics/gateway#message-reaction-add
   const channelId = messageReaction.message.channel.parent.id;


   // ignore bot reactions
   if (user.bot)
      return;


   // only listen for reactions in the suggestion channels
   const rawChannelIds = (await firestore.collection(`channel`).doc(`suggestions`).get()).data();
   const channelIds = Object.values(rawChannelIds);

   if (!channelIds.includes(channelId))
      return;


   // exclude bug report "suggestions"
   if (channelId === rawChannelIds[`bug-reports`])
      return;


   // this suggestion has under 10 votes but has the popular tag
   const popularTag = messageReaction.message.channel.parent.availableTags.find(tag => tag.name === `[ POPULAR ]`).id;
   const popularTagIndex = messageReaction.message.channel.appliedTags.findIndex(id => id === popularTag);

   if (popularTagIndex > 0)
      messageReaction.message.channel.appliedTags.splice(popularTagIndex, 1);

   if (messageReaction.users.cache.size <= 10)
      await messageReaction.message.channel.setAppliedTags([ ...messageReaction.message.channel.appliedTags ]);
};