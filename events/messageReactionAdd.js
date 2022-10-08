export const name = Discord.Events.MessageReactionAdd;
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
   if ([ `⬇️`, `❌`, `⛔`, `🚫`, `⏬`, `⤵️`, `👇`, `👎`, `📉`, `🔽`, `🤬` ].includes(messageReaction.emoji.name) || messageReaction.emoji.id)
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


   // remove reactions from suggestions banned people
   const guild = await tryOrUndefined(messageReaction.client.guilds.fetch(process.env.GUILD_AREA_COMMUNITY));
   const member = await tryOrUndefined(guild?.members.fetch(user.id));

   const database = firestore.collection(`role`).doc(`suggestions-banned`);
   const { "role": suggestionsBannedId } = (await database.get()).data() || {};

   if (member?.roles.cache.has(suggestionsBannedId))
      await tryOrUndefined(messageReaction.users.remove(user.id));


   // remove the thread's starter message's author's reaction
   const starterMessage = await tryOrUndefined(messageReaction.message.channel.fetchStarterMessage());
   if (starterMessage?.author.id === user.id)
      await tryOrUndefined(messageReaction.users.remove(user.id));


   // the post was made by a bot, don't edit its tags
   if (starterMessage?.author.bot)
      return;


   // this suggestion has 10+ votes and doesn't already have the popular tag
   const popularTag = messageReaction.message.channel.parent.availableTags.find(tag => tag.name === `[ POPULAR ]`).id;

   if ((await messageReaction.users.fetch()).size >= 10 && !messageReaction.message.channel.appliedTags.includes(popularTag))
      await messageReaction.message.channel.setAppliedTags([ ...messageReaction.message.channel.appliedTags, popularTag ]);
};