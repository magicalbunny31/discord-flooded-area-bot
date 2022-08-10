export const name = Discord.Events.MessageReactionRemove;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.MessageReaction} messageReaction
 * @param {Discord.User} user
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (messageReaction, user, redis) => {
   // reaction enums
   const upvote   = `⬆️`;
   const downvote = `⬇️`;


   // ignore reactions that aren't votes
   if (![ upvote, downvote ].includes(messageReaction.emoji.name))
      return;


   // some variables that are guaranteed to exist due to partials
   // https://discord.com/developers/docs/topics/gateway#message-reaction-add
   const channelId = messageReaction.message.channel.id;
   const messageId = messageReaction.message.id;


   // flooded area 🌊's vote was removed, react back to the message
   if (user.id === messageReaction.client.user.id)
      return await messageReaction.message.react(messageReaction.emoji.name);


   // ignore other bot reactions
   if (user.bot)
      return;


   // only listen for reactions in the suggestion channels
   const rawChannelIds = await redis.HGETALL(`flooded-area:channel:suggestions`);
   const channelIds = Object.values(rawChannelIds);

   if (!channelIds.includes(channelId))
      return;


   // what type of suggestion this suggestion is exactly
   const channelTypes = Object.fromEntries(Object.entries(rawChannelIds).map(id => id.reverse())); // reverse the object's keys with its values
   const type         = channelTypes[channelId];                                                   // use the channel id to find the object's key (the suggestion type)
   const suggestion   = await redis.HGETALL(`flooded-area:${type}:${messageId}`);                  // fetch this suggestion from the database


   // this vote isn't from a suggestion message
   if (!Object.keys(suggestion).length)
      return;


   // the user who reacted is the suggestion author so this reaction removal was from flooded area 🌊
   if (suggestion.suggester === user.id)
      return;


   // this user has already voted so this reaction removal was from flooded area 🌊
   const isUpvote          = messageReaction.emoji.name === upvote;
   const otherVoters       = JSON.parse(isUpvote ? suggestion.downvoters : suggestion.upvoters);
   const alreadyVotedOther = otherVoters.includes(user.id);

   if (alreadyVotedOther)
      return;


   // votes are locked, or this suggestion has been approved/denied so this reaction removal was from flooded area 🌊
   const locked = suggestion.locked === `true`;
   const approvedOrDenied = [ `approved`, `denied` ].includes(suggestion.status);

   if (locked || approvedOrDenied)
      return;


   // this suggestion's votes
   let upvotes   = +suggestion.upvotes;
   let downvotes = +suggestion.downvotes;

   const upvoters   = JSON.parse(suggestion.upvoters);
   const downvoters = JSON.parse(suggestion.downvoters);


   // this user has already voted, flooded area 🌊 is likely removing their vote
   if (
      (isUpvote ? downvoters : upvoters)
         .includes(user.id)
   )
      return;


   // add this user's vote
   isUpvote
      ? upvotes --
      : downvotes --;

   (isUpvote ? upvoters : downvoters)
      .splice(
         (isUpvote ? upvoters : downvoters).findIndex(userId => userId === user.id),
         1
      );


   // update the database
   await redis.HSET(`flooded-area:${type}:${messageId}`,
      isUpvote
         ? {
            "upvotes":  JSON.stringify(upvotes),
            "upvoters": JSON.stringify(upvoters)
         }
         : {
            "downvotes":  JSON.stringify(downvotes),
            "downvoters": JSON.stringify(downvoters)
         }
   );


   // find a colour based on the votes
   const cumulativeVotes = upvotes - downvotes;

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


   // update the suggestion's embed
   const message = await messageReaction.message.fetch();

   const embed = new Discord.EmbedBuilder(message.embeds[0].data)
      .setColor(
         [ `approved`, `denied` ].includes(suggestion.status)
            ? suggestion.status === `approved` ? 0x4de94c : 0xf60000
            : colour
      )
      .setFooter({
         text: [
            ...cumulativeVotes >= 10
               ? [ `🎉` ] : [],
            ...[ `approved`, `denied` ].includes(suggestion.status)
               ? [ suggestion.status === `approved` ? `✅` : `❎` ] : [],
            ...suggestion.locked === `true`
               ? [ `🔒` ] : []
         ]
            .join(`\n`)
         || null
      });


   // update the suggestion message
   await message.edit({
      embeds: [
         embed
      ]
   });
};