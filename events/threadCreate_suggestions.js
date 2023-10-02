export const name = Discord.Events.ThreadCreate;


import Discord from "discord.js";
import { strip, wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ThreadChannel} thread
 * @param {boolean} newlyCreated
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (thread, newlyCreated, firestore) => {
   // this post isn't from the suggestion channels
   if (![ process.env.FA_CHANNEL_GAME_SUGGESTIONS, process.env.FA_CHANNEL_SERVER_SUGGESTIONS, process.env.FA_CHANNEL_PART_SUGGESTIONS ].includes(thread.parent?.id))
      return;


   // this post isn't new, the bot was just added to it
   if (!newlyCreated)
      return;


   // wait a bit, because files may still be uploading so the starter message won't be available
   await wait(1000);


   // pin the starter message
   const starterMessage = await thread.fetchStarterMessage();
   await starterMessage.pin();


   // send typing to the post
   await thread.sendTyping();


   // application commands
   const commands = await thread.guild.commands.fetch();

   const jumpToTopCommandId = commands.find(command => command.name === `jump-to-top`)?.id || 0;


   // information content
   const emoji = {
      [process.env.FA_CHANNEL_GAME_SUGGESTIONS]:   `🎮`,
      [process.env.FA_CHANNEL_SERVER_SUGGESTIONS]: `📂`,
      [process.env.FA_CHANNEL_PART_SUGGESTIONS]:   `🧱`
   }[thread.parent.id];

   const suggestionsInformation = strip`
      ### ${emoji} Thanks for submitting to ${Discord.channelMention(thread.parent.id)}!
      > - Accept votes and discuss with the community to make ${thread} even more awesome.
      > - Edit the starter message ${starterMessage.url} so it's easier for others to read your edits.
      > - Once this post reaches 10 reactions, it'll receive the \`🎉 Popular\` tag.
      > - Check the Pinned Messages or use to ${Discord.chatInputApplicationCommandMention(`jump-to-top`, jumpToTopCommandId)} scroll to this post's starter message.
   `;


   // send the message to the post
   await thread.send({
      content: suggestionsInformation,
      flags: Discord.MessageFlags.SuppressEmbeds,
      allowedMentions: {
         parse: []
      }
   });
};