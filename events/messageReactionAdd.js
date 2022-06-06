export const name = `messageReactionAdd`;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.MessageReaction} messageReaction
 * @param {Discord.User} user
 */
export default async (messageReaction, user) => {
   // only listen for reactions in the suggestion channels
   const channelIds = [
      `983391293583523881`,
      `983391792131108885`,
      `983391983487815791`
   ];

   if (!channelIds.includes(messageReaction.message?.channel.id) || !messageReaction.message)
      return;


   // ignore bots
   if (user.bot)
      return;


   // remove the suggestion's author's vote (from their own suggestion)
   const removeAuthorVote = async () => {
      // get the id of the suggestion's author
      const message = await messageReaction.message?.fetch();
      const author = message?.embeds[0].data.author.name;
      const authorId = author?.match(/\([^()]*\)/g)?.pop().slice(1, -1);


      // get the id of the user who just reacted to this suggestion
      const reactionUserId = user.id;


      // only remove the reaction's emoji if it's ⬇️ or ⬆️
      if (![ `⬆️`, `⬇️` ].includes(messageReaction.emoji.name))
         return;


      // only remove the reaction if this is the same user who made this suggestion
      if (authorId !== reactionUserId)
         return;


      // remove this user's reaction
      return await messageReaction.users.remove(reactionUserId);
   };

   await removeAuthorVote();


   // remove a duplicate vote
   const removeDuplicateVote = async () => {
      // check if they've voted the other
      const otherVote = messageReaction.emoji.name === `⬆️` ? `⬇️` : `⬆️`;
      const otherMessageReaction = await messageReaction.message.reactions.resolve(otherVote).fetch();
      const votedUsers = await otherMessageReaction.users.fetch();
      const hasVotedOther = votedUsers.has(user.id);


      // remove their vote (will have a try/catch just in case)
      if (hasVotedOther)
         try {
            return await messageReaction.users.remove(user.id);
         } catch {
            return;
         };
   };

   await removeDuplicateVote();
};