export const name = Discord.Events.ThreadCreate;


import Discord from "discord.js";
import { colours, emojis, strip, sum, wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ThreadChannel} thread
 * @param {boolean} newlyCreated
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (thread, newlyCreated, firestore) => {
   // this post isn't from the suggestion channels
   if (![ process.env.CHANNEL_GAME_SUGGESTIONS, process.env.CHANNEL_SERVER_SUGGESTIONS, process.env.CHANNEL_PART_SUGGESTIONS ].includes(thread.parent?.id))
      return;


   // this post isn't new, the bot was just added to it
   if (!newlyCreated)
      return;


   // wait a bit, because files may still be uploading so the starter message won't be available
   await wait(1000);


   // this post's starter message content doesn't reach the minimum character limit (excludes server suggestions)
   const starterMessage = await thread.fetchStarterMessage();

   if ((starterMessage.content || ``).length < 100 && thread.parent?.id !== process.env.CHANNEL_SERVER_SUGGESTIONS) {
      // create a private thread in the bot channel
      const botChannel = await thread.guild.channels.fetch(process.env.CHANNEL_BOT_COMMANDS);

      const createdThread = await botChannel.threads.create({
         name: `❌┃your-suggestion-was-blocked`,
         autoArchiveDuration: Discord.ThreadAutoArchiveDuration.OneHour,
         type: Discord.ChannelType.PrivateThread,
         invitable: false
      });

      // send a message as to why their suggestion was blocked
      await createdThread.send({
         content: strip`
            Hello, ${starterMessage.author}! 👋

            Your ${Discord.channelMention(thread.parent.id)} "${Discord.escapeMarkdown(thread.name)}" __could not be sent__ due to the following reason:
            > \\- Your suggestion does not reach the __minimum character limit of 100 characters__.

            Fix up these issues then feel free to __re-submit your suggestion__!
            __You are not in trouble__. This is just a friendly reminder from ${thread.client.user}.
         `
      });

      // send their (blocked) suggestion in the thread too
      await createdThread.sendTyping();

      const maxUploadLimit = (() => {
         switch (thread.guild.premiumTier) {
            case Discord.GuildPremiumTier.None:  return  25;
            case Discord.GuildPremiumTier.Tier1: return  25;
            case Discord.GuildPremiumTier.Tier2: return  50;
            case Discord.GuildPremiumTier.Tier3: return 100;
         }
      })();

      const attachmentsTooLarge = sum(starterMessage.attachments.map(attachment => attachment.size)) / 1e+6 > maxUploadLimit; // attachments file size > max upload limit (in mb)

      await createdThread.send({
         content: attachmentsTooLarge && starterMessage.attachments.size
            ? `Your attachments for this suggestion were too large to attach to this message. Sorry!`
            : null,
         embeds: starterMessage.content
            ? [
               new Discord.EmbedBuilder()
                  .setColor(starterMessage.author.accentColor || (await starterMessage.author.fetch(true)).accentColor || colours.flooded_area)
                  .setDescription(starterMessage.content)
                  .setFooter({
                     text: `Here is your suggestion! You can copy it for editing later.`
                  })
            ]
            : [],
         files: !attachmentsTooLarge && starterMessage.attachments.size
            ? starterMessage.attachments.map(attachment =>
               new Discord.AttachmentBuilder()
                  .setFile(attachment.url)
            )
            : []
      });

      // delete their suggestion
      return await thread.delete();
   };


   // pin the starter message
   await starterMessage.pin();


   // send typing to the post
   await thread.sendTyping();


   // command id
   const botCommands = await thread.guild.commands.fetch();
   const topCommandId = botCommands.find(command => command.name === `top`).id;


   // information content
   const suggestionsInformation = strip`
      - Thanks for submitting to ${Discord.channelMention(thread.parent.id)}!
      - __Accept votes and discuss__ with the community to make ${thread} even more awesome.
      - __Edit the starter message ${starterMessage.url}__ so it's easier for others to read your edits.
      - Once this post reaches __10 reactions__, it'll receive the \`🎉 Popular\` tag.
      - Use ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`top`, topCommandId)} or check the Pinned Messages to __scroll to this post's starter message__.
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