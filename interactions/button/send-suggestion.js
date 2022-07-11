import Discord from "discord.js";
import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * send the user's suggestion to its suggestion channel
 * @param {Discord.ButtonInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // button info
   const [ _button, type ] = interaction.customId.split(`:`);


   // function to try to fetch something or return null instead of throwing
   const tryOrUndefined = async promise => {
      try {
         return await promise;
      } catch {
         return undefined;
      };
   };


   // get the channel to send this suggestion to
   const channelId = await redis.HGET(`flooded-area:channels:suggestions`, type);
   const channel = await tryOrUndefined(interaction.guild.channels.fetch(channelId));


   // channel doesn't exist in guild
   if (!channel)
      return await interaction.editReply({
         content: strip`
            ❌ **Can't fetch the channel to send this suggestion to.**
            > Consider contacting a member of the ${Discord.roleMention(`989125486590451732`)} or try again later.
         `,
         embeds: [],
         components: []
      });


   // suggestion embed to send
   const embeds = interaction.message.embeds;


   // "defer" the interaction
   await interaction.update({
      content: `Sending to ${channel}... ${emojis.loading}`,
      components: []
   });


   // send to the channel
   const suggestionMessage = await channel.send({
      embeds
   });


   // boolean stuff for setting stuff in database
   const isPartSuggestion = type === `part-suggestion`;
   const hasImage = !!embeds[0].image?.url;


   // add the suggestion to the database
   await redis.HSET(`flooded-area:${type}:${suggestionMessage.id}`, {
      "suggester": interaction.user.id,
      ...!isPartSuggestion
         ? {
            "content": embeds[0].description
         }
         : {
            "name": embeds[0].fields[0].value,
            "description": embeds[0].fields[1].value
         },
      "created-timestamp": JSON.stringify(suggestionMessage.createdTimestamp),
      "last-updated-timestamp": JSON.stringify(suggestionMessage.createdTimestamp),

      ...hasImage
         ? {
            "image-url": embeds[0].image.url
         }
         : {},
      "message-url": suggestionMessage.url,

      "status": `open for discussion`,
      "locked": JSON.stringify(false),
      "deleted": JSON.stringify(false),

      "upvotes": JSON.stringify(0),
      "upvoters": JSON.stringify([]),
      "downvotes": JSON.stringify(0),
      "downvoters": JSON.stringify([]),

      "edits": JSON.stringify([])
   });


   // add voting to the suggestion message
   await suggestionMessage.react(`⬆️`);
   await suggestionMessage.react(`⬇️`);


   // create the thread's name
   const suggestionOrPartName = !isPartSuggestion
      ? embeds[0].description
      : embeds[0].fields[0].value;

   const maxLength = 30;
   const splitThreadName = suggestionOrPartName.replace(/[\n]+/g, ` `).split(` `);
   let threadName = ``;

   for (const [ i, word ] of splitThreadName.entries()) {
      if (threadName.trim().length + word.length >= maxLength) {
         // limit the thread name to 30 characters without truncating a word
         threadName = `💬 ${threadName.trim() || word.slice(0, maxLength)}...`;
         break;

      } else {
         // add this word the thread name
         threadName += ` ${word}`;

         // this name can fit the whole of the thread's name
         if (i + 1 === splitThreadName.length)
            threadName = `💬 ${threadName.trim()}`;
      };
   };


   // create the thread for the suggestion message
   const suggestionThread = await suggestionMessage.startThread({
      name: threadName
   });


   // send the message containing settings to the thread
   await suggestionThread.send({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(0x4de94c)
            .setTitle(`\\#️⃣ Suggestion Discussions`)
            .setDescription(strip`
               **🎫 Status**
               > Open for discussion since ${Discord.time(Math.floor(suggestionThread.createdTimestamp / 1000), Discord.TimestampStyles.RelativeTime)}.

               **📝 Edits**
               > No edits to list.
            `)
      ],
      components: [
         new Discord.ActionRowBuilder()
            .setComponents([
               new Discord.ButtonBuilder()
                  .setCustomId(`edit-suggestion:${suggestionMessage.id}`)
                  .setLabel(`Edit Suggestion`)
                  .setEmoji(`📝`)
                  .setStyle(Discord.ButtonStyle.Secondary)
            ]),
         new Discord.ActionRowBuilder()
            .setComponents([
               new Discord.SelectMenuBuilder()
                  .setCustomId(`suggestion-settings:${suggestionMessage.id}`)
                  .setPlaceholder(`🔧 Suggestion Settings...`)
                  .setOptions([
                     new Discord.SelectMenuOptionBuilder()
                        .setLabel(`Approve Suggestion`)
                        .setDescription(`Set this suggestion's status as approved.`)
                        .setValue(`approve-suggestion`)
                        .setEmoji(`✅`),
                     new Discord.SelectMenuOptionBuilder()
                        .setLabel(`Deny Suggestion`)
                        .setDescription(`Set this suggestion's status as denied.`)
                        .setValue(`deny-suggestion`)
                        .setEmoji(`❎`),
                     new Discord.SelectMenuOptionBuilder()
                        .setLabel(`Lock Suggestion`)
                        .setDescription(`Lock this suggestion's votes.`)
                        .setValue(`lock-suggestion`)
                        .setEmoji(`🔒`),
                     new Discord.SelectMenuOptionBuilder()
                        .setLabel(`Delete Suggestion`)
                        .setDescription(`Removes this suggestion and deletes this thread.`)
                        .setValue(`delete-suggestion`)
                        .setEmoji(`🗑️`)
                  ])
            ])
      ]
   });


   // add the suggestion author to the thread
   await suggestionThread.members.add(interaction.member);


   // edit the reply to show that the suggestion was sent
   await interaction.editReply({
      content: `Sent to ${channel}! ✅`
   });
};