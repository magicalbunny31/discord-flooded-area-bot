export const name = Discord.Events.ThreadUpdate;


import Discord from "discord.js";
import { set } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ThreadChannel} oldThread
 * @param {Discord.ThreadChannel} newThread
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (oldThread, newThread, firestore) => {
   // this post isn't from the suggestion channels
   if (![ process.env.CHANNEL_GAME_SUGGESTIONS, process.env.CHANNEL_SERVER_SUGGESTIONS, process.env.CHANNEL_PART_SUGGESTIONS ].includes(newThread.parent?.id))
      return;


   // get this post's tags (formatted by their names)
   const channelTags = newThread.parent.availableTags;

   const oldPostTags = oldThread.appliedTags.map(tagId => channelTags.find(channelTag => channelTag.id === tagId).name);
   const newPostTags = newThread.appliedTags.map(tagId => channelTags.find(channelTag => channelTag.id === tagId).name);


   // constants
   const addedInGameTag = `Added In-Game`;
   const deniedTag      = `Denied`;

   const closureTags = [ addedInGameTag, deniedTag ];


   // the newThread's tags contains a closure tag
   if (newPostTags.some(tag => closureTags.includes(tag))) {
      // lock this post
      await newThread.setLocked(true);

      // close this post
      return await newThread.setArchived(true);
   };


   // meta tags, only one can be set at a time
   const metaTags = [
      `Staff Picks`,
      `Being Developed...`,
      `Approved For Update`,
      `Added In-Game`,
      `Denied`
   ];


   // both oldThread and newThread have meta tags
   if (oldPostTags.some(tag => metaTags.includes(tag)) && newPostTags.some(tag => metaTags.includes(tag))) {
      // accept newThread's meta tag
      const [ acceptedMetaTag ] = newPostTags.filter(tag => metaTags.includes(tag) && oldPostTags.indexOf(tag) === -1);

      // no accepted meta tag found, stop here
      if (!acceptedMetaTag)
         return;

      // remove all current meta tags
      for (const metaTag of metaTags)
         if (newPostTags.includes(metaTag))
            newPostTags.splice(newPostTags.findIndex(postTag => postTag === metaTag), 1);

      // add the new meta tag
      newPostTags.push(acceptedMetaTag);

      // set this post's new meta tags
      const tagsToApply = newPostTags.map(tag => channelTags.find(channelTag => channelTag.name === tag).id);
      await newThread.setAppliedTags(tagsToApply);
   };
};