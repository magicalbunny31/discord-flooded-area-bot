export const name = `messageReactionRemove`;
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


   // reaction enums
   const upvote   = `⬆️`;
   const downvote = `⬇️`;


   // ignore reactions that aren't votes
   if (![ upvote, downvote ].includes(messageReaction.emoji.name))
      return;


   // this message
   const message = await messageReaction.message.fetch();


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


   // the embed hasn't changed
   const [ embed ] = message.embeds;

   if (embed.data.color === newColour)
      return;


   // update the suggestion's embed
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
};