export const name = `messageReactionRemove`;
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


   // this message
   const message = await messageReaction.message.fetch();
   const suggestionAuthorId = suggestion.suggester;


   // this suggestion's votes
   const partialUpvotes   = messageReaction.message.reactions.resolve(upvote);
   const partialDownvotes = messageReaction.message.reactions.resolve(downvote);

   if (!partialUpvotes || !partialDownvotes)
      return; // this value is required to be present to continue

   const upvotes   = await partialUpvotes  .fetch();
   const downvotes = await partialDownvotes.fetch();

   const usersWhoHaveUpvoted   = await upvotes  .users.fetch();
   const usersWhoHaveDownvoted = await downvotes.users.fetch();


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
   const reactionUserHasUpvoted = messageReaction.emoji.id === upvote || messageReaction.emoji.name === upvote;
   return await redis.HSET(`flooded-area:${type}:${messageReaction.message.id}`,
      reactionUserHasUpvoted
         ? {
            "upvotes": JSON.stringify(numberOfUpvotes - 1),
            "upvoters": JSON.stringify([ ...usersWhoHaveUpvoted.filter(user => user.id !== messageReaction.client.user.id).values() ])
         }
         : {
            "downvotes": JSON.stringify(numberOfDownvotes - 1),
            "downvoters": JSON.stringify([ ...usersWhoHaveDownvoted.filter(user => user.id !== messageReaction.client.user.id).values() ])
         }
   );
};