export const name = Discord.Events.ThreadUpdate;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.ThreadChannel} oT
 * @param {Discord.ThreadChannel} nT
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (oT, nT, redis) => {
   // fetch these channels from their partial structures
   const oldThread = await oT.client.channels.fetch(oT.id);
   const newThread = await nT.client.channels.fetch(nT.id);


   // the parent channel of this thread isn't a suggestion channel
   const rawChannelIds = await redis.HGETALL(`flooded-area:channel:suggestions`);
   const channelIds = Object.values(rawChannelIds);

   if (!channelIds.includes(newThread.parent.id))
      return;


   // this thread's locked status didn't change
   const oldThreadLocked = oldThread.locked;
   const newThreadLocked = newThread.locked;

   if (oldThreadLocked === newThreadLocked)
      return;


   // what type of suggestion this suggestion is exactly
   const channelTypes = Object.fromEntries(Object.entries(rawChannelIds).map(id => id.reverse())); // reverse the object's keys with its values
   const type         = channelTypes[newThread.parent.id];                                         // use the channel id to find the object's key (the suggestion type)


   // this thread's message isn't a suggestion
   const suggestionId = newThread.id;

   if (!await redis.EXISTS(`flooded-area:${type}:${suggestionId}`))
      return;


   // set this thread as its opposite locked status in the database
   await redis.HSET(`flooded-area:${type}:${suggestionId}`, {
      "last-updated-timestamp": JSON.stringify(newThread.archiveTimestamp),
      "locked": JSON.stringify(!oldThreadLocked && newThreadLocked)
   });


   // new suggestion embed
   const [ upvotes, downvotes, status ] = await redis.HMGET(`flooded-area:${type}:${suggestionId}`, [ `upvotes`, `downvotes`, `status` ]);
   const suggestionMessage = await newThread.fetchStarterMessage();

   const suggestionEmbed = new Discord.EmbedBuilder(suggestionMessage.embeds[0].data)
      .setFooter({
         text: [
            ...+upvotes - +downvotes >= 10
               ? [ `🎉` ] : [],
            ...[ `approved`, `denied` ].includes(status)
               ? [ status === `approved` ? `✅` : `❎` ] : [],
            ...!oldThreadLocked && newThreadLocked
               ? [ `🔒` ] : []
         ]
            .join(``)
         || null
      });


   // edit the suggestion message
   return await suggestionMessage.edit({
      embeds: [
         suggestionEmbed
      ]
   });
};