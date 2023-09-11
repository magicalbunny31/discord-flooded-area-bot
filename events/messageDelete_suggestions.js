export const name = Discord.Events.MessageDelete;


import Discord from "discord.js";
import { colours } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Message} message
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (message, firestore) => {
   // this post isn't from the suggestion channels
   if (![ process.env.FA_CHANNEL_GAME_SUGGESTIONS, process.env.FA_CHANNEL_SERVER_SUGGESTIONS, process.env.FA_CHANNEL_PART_SUGGESTIONS ].includes(message.channel.parent?.id))
      return;


   // get this post
   const thread = await message.channel.fetch();


   // check if this was the post's starter message
   const starterMessageDeleted = await (async () => {
      try {
         await thread.fetchStarterMessage();
         return false;
      } catch {
         return true;
      };
   })();

   if (!starterMessageDeleted)
      return;


   // send a message that the thread's original message was deleted
   await message.channel.sendTyping();

   await message.channel.send({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setTitle(`💥 This suggestion's original message was deleted`)
            .setDescription(`> - ${message.channel} will now be locked and closed.`)
      ]
   });


   // lock and close this post
   await thread.setLocked(true);
   await thread.setArchived(true);
};