export const name = `messageReactionAdd`;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.MessageReaction} messageReaction
 * @param {Discord.User} user
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (messageReaction, user, redis) => {
   // only listen for reactions in the suggestion channels
   const rawChannelIds = await redis.HGETALL(`flooded-area:channels:suggestions`);
   const channelIds = Object.values(rawChannelIds);

   if (!channelIds.includes(messageReaction.message?.channel.id) || !messageReaction.message)
      return;


   // type of suggestion
   const channelTypes = Object.fromEntries(Object.entries(rawChannelIds).map(id => id.reverse()));
   const type = channelTypes[messageReaction.message.channel.id];
   const suggestion = await redis.HGETALL(`flooded-area:${type}:${messageReaction.message.id}`);


   // ignore bots
   if (user.bot)
      return;


   // reaction enums
   const upvote   = `⬆️`;
   const downvote = `⬇️`;


   // ignore reactions that aren't votes
   if (![ upvote, downvote ].includes(messageReaction.emoji.name))
      return;


   // function to remove this reaction
   const removeReaction = async () => {
      try {
         void await messageReaction.users.remove(user.id);
      } catch {
         return;
      };
   };


   // this message
   const message = await messageReaction.message.fetch();
   const suggestionAuthorId = suggestion.suggester;


   // the member that reacted
   const reactionUserId = user.id;
   const reactionMember = await messageReaction.message.guild.members.fetch(reactionUserId);


   // the user who reacted is the suggestion author
   if (suggestionAuthorId === reactionUserId)
      return await removeReaction();


   // this member is banned from making suggestions
   const suggestionsBannedRoleId = `979489114153963560`;
   const reactionMemberIsSuggestionsBanned = reactionMember.roles.cache.has(suggestionsBannedRoleId);

   if (reactionMemberIsSuggestionsBanned)
      return await removeReaction();


   // this suggestion's votes
   const partialUpvotes   = messageReaction.message.reactions.resolve(upvote);
   const partialDownvotes = messageReaction.message.reactions.resolve(downvote);

   if (!partialUpvotes || !partialDownvotes)
      return; // this value is required to be present to continue

   const upvotes   = await partialUpvotes  .fetch();
   const downvotes = await partialDownvotes.fetch();

   const usersWhoHaveUpvoted   = await upvotes  .users.fetch();
   const usersWhoHaveDownvoted = await downvotes.users.fetch();


   // this user has already voted
   const reactionUserHasUpvoted = messageReaction.emoji.id === upvote || messageReaction.emoji.name === upvote;
   const otherVoteMessageReactionUsers = reactionUserHasUpvoted ? usersWhoHaveDownvoted : usersWhoHaveUpvoted;
   const reactionUserHasVotedOtherVote = otherVoteMessageReactionUsers.has(reactionUserId);

   if (reactionUserHasVotedOtherVote)
      return await removeReaction();


   // find a colour based on the votes
   const numberOfUpvotes   = [ ...usersWhoHaveUpvoted  .values() ].length;
   const numberOfDownvotes = [ ...usersWhoHaveDownvoted.values() ].length;

   const cumulativeVotes = numberOfUpvotes - numberOfDownvotes;

   const positiveColours = [ 0xfaee00, 0xedef00, 0xd8ef04, 0xc0ee16, 0xa5ee26, 0x88ec35, 0x6deb41, 0x57e949, 0x4de94c ];
   const neutralColour   =   0xffee00;
   const negativeColours = [ 0xffe800, 0xffd800, 0xffc100, 0xffa400, 0xff8400, 0xff6300, 0xfc4100, 0xf81e00, 0xf60000 ];

   const newColour =
      cumulativeVotes === 0
         ? neutralColour
         : cumulativeVotes > 0
            ? positiveColours[         cumulativeVotes ] || positiveColours[8]
            : negativeColours[Math.abs(cumulativeVotes)] || negativeColours[8];


   // update the suggestion's embed
   const [ embed ] = message.embeds;

   embed.data.color = newColour;
   embed.data.footer = {
      text: cumulativeVotes >= 10 ? `POPULAR! 🎉` : null
   };


   // update the suggestion message
   await message.edit({
      embeds: [
         embed
      ]
   });


   // update the database
   return await redis.HSET(`flooded-area:${type}:${messageReaction.message.id}`,
      reactionUserHasUpvoted
         ? {
            "upvotes": `${numberOfUpvotes - 1}`,
            "upvoters": JSON.stringify([ ...usersWhoHaveUpvoted.filter(user => user.id !== messageReaction.client.user.id).values() ])
         }
         : {
            "downvotes": `${numberOfDownvotes - 1}`,
            "downvoters": JSON.stringify([ ...usersWhoHaveDownvoted.filter(user => user.id !== messageReaction.client.user.id).values() ])
         }
   );
};