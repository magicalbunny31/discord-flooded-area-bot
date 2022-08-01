import Discord from "discord.js";
import { emojis, set, strip, wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * confirm a user's edits for a suggestion
 * @param {Discord.ButtonInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // button info
   const [ _button, type ] = interaction.customId.split(`:`);


   // suggestion embed fields to edit (note: these variables actually have to be null)
   const [ embed ] = interaction.message.embeds;

   const suggestionOrPartName         = embed.description || embed.fields[0] .value;                             // suggestions for game/server  /  name        for part
   const imageOrPartDescriptionOrNull =                      embed.fields[1]?.value || embed.image?.url || null; // image       for game/server  /  description for part
   const partImageOrNull              =                                               embed.image?.url || null; //                                 image       for part


   // boolean stuff for setting stuff in database
   const isPartSuggestion = type === `part-suggestions`;
   const hasImage = !!embed.image?.url;


   // "defer" the interaction
   const suggestionMessage = await interaction.channel.fetchStarterMessage();

   await interaction.update({
      content: `Editing ${Discord.hyperlink(`suggestion`, suggestionMessage.url, `${suggestionMessage.url} 🔗`)}... ${emojis.loading}`,
      components: []
   });


   // get this suggestion
   const suggestionId = interaction.channel.id;
   const suggestion = await redis.HGETALL(`flooded-area:${type}:${suggestionId}`);


   // edit the suggestion
   const newEmbed = new Discord.EmbedBuilder(suggestionMessage.embeds[0].data)
      .setImage(!isPartSuggestion ? imageOrPartDescriptionOrNull : partImageOrNull);

   !isPartSuggestion
      ? newEmbed
         .setDescription(suggestionOrPartName)
      : newEmbed
         .setFields({
            name: `PART NAME`,
            value: suggestionOrPartName
         }, {
            name: `PART DESCRIPTION`,
            value: imageOrPartDescriptionOrNull
         });


   // edit the suggestion
   const newSuggestionMessage = await suggestionMessage.edit({
      embeds: [
         newEmbed
      ]
   });


   // add this edit to the database
   const edits = JSON.parse(suggestion.edits);

   edits.push({
      "created-timestamp": newSuggestionMessage.editedTimestamp,
      "editor": interaction.user.id,
      ...!isPartSuggestion
         ? {
            "content": newEmbed.data.description
         }
         : {
            "name": newEmbed.data.fields[0].value,
            "description": newEmbed.data.fields[1].value
         },
      ...hasImage
         ? {
            "image-url": newEmbed.data.image.url
         }
         : {},
      "upvotes": +suggestion.upvotes,
      "downvotes": +suggestion.downvotes
   });

   await redis.HSET(`flooded-area:${type}:${newSuggestionMessage.id}`, {
      ...!isPartSuggestion
         ? {
            "content": newEmbed.data.description
         }
         : {
            "name": newEmbed.data.fields[0].value,
            "description": newEmbed.data.fields[1].value
         },
      "last-updated-timestamp": JSON.stringify(newSuggestionMessage.editedTimestamp),

      ...hasImage
         ? {
            "image-url": newEmbed.data.image.url
         }
         : {},

      "edits": JSON.stringify(edits)
   });


   // create the thread's name
   const threadName = (() => {
      const splitPreviewContent = Discord.cleanContent(suggestionOrPartName, interaction.channel).replace(/[\n]+/g, ` `).split(` `);
      let previewContent = ``;

      for (const [ i, word ] of splitPreviewContent.entries()) {
         if (previewContent.trim().length + word.length >= 30) {
            // limit the thread name to 50 characters without truncating a word
            previewContent = `${previewContent.trim() || word.slice(0, 30)}...`;
            break;

         } else {
            // add this word the thread name
            previewContent += ` ${word}`;

            // this name can fit the whole of the thread's name
            if (i + 1 === splitPreviewContent.length)
               previewContent = previewContent.trim();
         };
      };

      return previewContent;
   })();


   // edit the thread's name
   await newSuggestionMessage.thread.edit({
      name: threadName
   });


   // get this suggestion message's settings message
   const settingsMessage = await (async () => {
      const thread = interaction.channel;
      const messages = await (async () => {
         const fetchedMessages = [];
         let lastMessage;

         while (true) {
            const messages = (await thread.messages.fetch({ limit: 100, ...fetchedMessages.length ? { before: fetchedMessages.at(-1).id } : {} }))
               .filter(message => message.author.id === interaction.client.user.id && !message.system);

            fetchedMessages.push(...messages.values());

            if (lastMessage?.id === fetchedMessages.at(-1).id)
               break;

            else
               lastMessage = fetchedMessages.at(-1);

            await wait(1000);
         };

         return fetchedMessages;
      })();

      return messages
         .filter(message => message.author.id === interaction.client.user.id)
         .find(message => message.embeds[0]?.title === `\\#️⃣ Suggestion Discussions`);
   })();


   // new settings embed
   const toHuman = array => array.concat(array.splice(-2, 2).join(` and `)).join(`, `);

   const editors = set(edits.map(edit => Discord.userMention(edit.editor)));
   const lastEdit = edits.at(-1);

   const newSettingsMessageEmbed = new Discord.EmbedBuilder(settingsMessage.embeds[0].data)
      .setDescription(strip`
         **${
            suggestion.status === `open for discussion`
               ? `💬`
               : suggestion.status === `approved`
                  ? `✅`
                  : `❎`
         } Status**
         ${
            [ `approved`, `denied` ].includes(suggestion.status)
               ? strip`
                  > ${suggestion.status === `approved` ? `Approved` : `Denied`} by ${Discord.userMention(suggestion[`status-changer`])} ${Discord.time(Math.floor(+suggestion[`last-updated-timestamp`] / 1000), Discord.TimestampStyles.RelativeTime)}.
                  > \`${suggestion[`status-reason`]}\`
               `
               : `> Open for discussion since ${Discord.time(Math.floor(+suggestion[`last-updated-timestamp`] / 1000), Discord.TimestampStyles.RelativeTime)}.`
         }

         **✏️ Editors**
         > Edited by ${toHuman(editors)}.
         > Last edited by ${Discord.userMention(lastEdit.editor)} ${Discord.time(Math.floor(lastEdit[`created-timestamp`] / 1000), Discord.TimestampStyles.RelativeTime)}
      `);


   // enable the "📃 view edits" button (if it hasn't been already)
   settingsMessage.components[0].components[1].data.disabled = false;


   // edit the settings message
   await settingsMessage.edit({
      embeds: [
         newSettingsMessageEmbed
      ],
      components: settingsMessage.components
   });


   // edit the reply to show that the suggestion was edited
   await interaction.editReply({
      content: `${Discord.hyperlink(`Suggestion`, suggestionMessage.url, `${suggestionMessage.url} 🔗`)} edited! ✅`
   });
};