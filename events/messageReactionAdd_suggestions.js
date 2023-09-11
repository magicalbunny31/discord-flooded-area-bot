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
   const bannedEmojis = [ `⬇️`, `❌`, `⛔`, `🚫`, `⏬`, `⤵️`, `👇`, `👎`, `📉`, `🔽`, `🤬` ];

   if (bannedEmojis.includes(messageReaction.emoji.name) || messageReaction.emoji.id)
      return;


   // this post isn't from the suggestion channels
   if (![ process.env.FA_CHANNEL_GAME_SUGGESTIONS, process.env.FA_CHANNEL_SERVER_SUGGESTIONS, process.env.FA_CHANNEL_PART_SUGGESTIONS ].includes(messageReaction.message.channel.parent?.id))
      return;


   // ignore bot reactions
   if (user.bot)
      return;



   // remove reactions from suggestions banned people
   const guild = await tryOrUndefined(messageReaction.client.guilds.fetch(process.env.GUILD_FLOODED_AREA));
   const member = await tryOrUndefined(guild?.members.fetch(user.id));

   if (member?.roles.cache.has(process.env.FA_ROLE_SUGGESTIONS_BANNED))
      return await tryOrUndefined(messageReaction.users.remove(user.id));


   // remove the thread's starter message's author's reaction
   const starterMessage = await tryOrUndefined(messageReaction.message.channel.fetchStarterMessage());
   if (starterMessage?.author.id === user.id)
      return await tryOrUndefined(messageReaction.users.remove(user.id));


   // the post was made by a bot, don't edit its tags
   if (starterMessage?.author.bot)
      return;


   // this suggestion's highest reaction emoji has 10+ reactions and doesn't already have the popular tag
   const message = await messageReaction.message.fetch();
   const highestMessageReactionCount = message.reactions.cache
      .filter(messageReaction => !bannedEmojis.includes(messageReaction.emoji.name))
      .sort((a, b) => a.count - b.count)
      .at(-1)
      ?.count
      || 0;

   const popularTag = messageReaction.message.channel.parent.availableTags.find(tag => tag.name === `Popular`).id;

   if (highestMessageReactionCount >= 10 && !messageReaction.message.channel.appliedTags.includes(popularTag))
      await messageReaction.message.channel.setAppliedTags([ ...messageReaction.message.channel.appliedTags, popularTag ]);
};