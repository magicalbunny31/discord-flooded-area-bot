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


   // removed a banned user's vote
   const removeBannedVote = async () => {
      // check if this user is suggestions banned and remove their vote (will have a try/catch just in case)
      const member = await messageReaction.message.guild.members.fetch(user.id);

      if (member.roles.cache.has(`979489114153963560`))
         try {
            return await messageReaction.users.remove(user.id);
         } catch {
            return;
         };
   };

   await removeBannedVote();


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


   // update the embed depending on its total votes
   const updateEmbed = async () => {
      // fetch votes
      const upvotes    = [ ...(await (await messageReaction.message.reactions.resolve(`⬆️`).fetch()).users.fetch()).values() ].length;
      const downvotes  = [ ...(await (await messageReaction.message.reactions.resolve(`⬇️`).fetch()).users.fetch()).values() ].length;

      const totalVotes = upvotes - downvotes;


      // possible colours for the embed
      const up      = [ 0xfaee00, 0xedef00, 0xd8ef04, 0xc0ee16, 0xa5ee26, 0x88ec35, 0x6deb41, 0x57e949, 0x4de94c ];
      const neutral = 0xffee00;
      const down    = [ 0xffe800, 0xffd800, 0xffc100, 0xffa400, 0xff8400, 0xff6300, 0xfc4100, 0xf81e00, 0xf60000 ];

      const setColour =
         totalVotes === 0
            ? neutral
            : totalVotes > 0
               ? up  [         totalVotes ] || up  [8]
               : down[Math.abs(totalVotes)] || down[8];


      // update the embed
      const message = await messageReaction.message.fetch();
      const [ embed ] = message.embeds;
      embed.data.color = setColour;

      embed.data.footer = {
         text: totalVotes >= 10 ? `POPULAR! 🎉` : null
      };



      // edit the message
      return await message.edit({
         embeds: [
            embed
         ]
      });
   };

   await updateEmbed();
};