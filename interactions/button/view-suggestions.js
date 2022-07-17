import Discord from "discord.js";
import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * bulk-view suggestions
 * @param {Discord.ButtonInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // button info
   const [ _button, type, id, index ] = interaction.customId.split(`:`);


   // function to try to fetch something or return undefined instead of throwing
   const tryOrUndefined = async promise => {
      try {
         return await promise;
      } catch {
         return undefined;
      };
   };


   // function to check if a user is in this guild
   const userIsInGuild = async userId => !!await tryOrUndefined(interaction.guild.members.fetch(userId));


   // function to create the preview text from a suggestion's content
   const createPreviewText = content => {
      const maxLength = 50;
      const splitPreviewContent = content.replace(/[\n]+/g, ` `).split(` `);
      let previewContent = ``;

      for (const [ i, word ] of splitPreviewContent.entries()) {
         if (previewContent.trim().length + word.length >= maxLength) {
            // limit the thread name to 50 characters without truncating a word
            previewContent = `${previewContent.trim() || word.slice(0, maxLength)}...`;
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
   };


   // function to get a colour based on votes
   const getColour = (upvotes, downvotes) => {
      const cumulativeVotes = upvotes - downvotes;

      const positiveColours = [ 0xfaee00, 0xedef00, 0xd8ef04, 0xc0ee16, 0xa5ee26, 0x88ec35, 0x6deb41, 0x57e949, 0x4de94c ];
      const neutralColour   =   0xffee00;
      const negativeColours = [ 0xffe800, 0xffd800, 0xffc100, 0xffa400, 0xff8400, 0xff6300, 0xfc4100, 0xf81e00, 0xf60000 ];

      return cumulativeVotes === 0
         ? neutralColour
         : cumulativeVotes > 0
            ? positiveColours[         cumulativeVotes ] || positiveColours[8]
            : negativeColours[Math.abs(cumulativeVotes)] || negativeColours[8];
   };


   // "defer" the interaction
   if (interaction.message.components.length > 1) {
      // disable all components
      for (const actionRow of interaction.message.components)
         for (const component of actionRow.components)
            component.data.disabled = true;

      // edit the select menu to show a loading state
      interaction.message.components[0].components[0].data.options = [
         new Discord.SelectMenuOptionBuilder()
            .setLabel(`Loading...`)
            .setValue(`uwu`)
            .setEmoji(emojis.loading)
            .setDefault(true)
      ];

      // edit the page button to show a loading state
      Object.assign(interaction.message.components[1].components[2].data, {
         label: null,
         emoji: Discord.parseEmoji(emojis.loading)
      });

   } else
      // edit the back button to show a loading state
      Object.assign(interaction.message.components[0].components[0].data, {
         label: null,
         emoji: Discord.parseEmoji(emojis.loading),
         disabled: true
      });

   // update the interaction
   await interaction.update({
      components: interaction.message.components
   });


   // get these suggestions at the index
   const suggestions = JSON.parse(await redis.LINDEX(`flooded-area:temporary-stuff:${id}`, +index));
   const length = await redis.LLEN(`flooded-area:temporary-stuff:${id}`);


   // embeds
   const isPartSuggestion = type === `part-suggestions`;

   const embeds = suggestions.length
      ? await Promise.all(
         suggestions.map(async suggestion =>
            new Discord.EmbedBuilder()
               .setColor(
                  [ `approved`, `denied` ].includes(suggestion.status)
                     ? suggestion.status === `approved` ? 0x4de94c : 0xf60000
                     : getColour(+suggestion.upvotes, +suggestion.downvotes)
               )
               .setDescription(strip`
                  **${await userIsInGuild(suggestion.suggester) ? Discord.userMention(suggestion.suggester) : (await interaction.client.users.fetch(suggestion.suggester)).tag} at ${Discord.time(Math.floor(suggestion[`created-timestamp`] / 1000))}**
                  > ${Discord.hyperlink(Discord.escapeMarkdown(createPreviewText(!isPartSuggestion ? suggestion.content : suggestion.name)), suggestion[`message-url`], `${suggestion[`message-url`]} 🔗`)}
                  > ${[
                        ...[ `approved`, `denied` ].includes(suggestion.status)
                           ? [ `\`${suggestion.status === `approved` ? `Approved ✅` : `Denied ❎`}\`` ] : [],
                        `\`${suggestion.deleted === `true` ? `Deleted 🗑️` : suggestion.locked === `true` ? `Locked 🔒` : `Not locked 🔓`}\``
                     ]
                        .join(`, `)
                  }
                  > ⬆️ ${suggestion.upvotes} | ${suggestion.downvotes} ⬇️
               `)
         )
      )
      : [
         new Discord.EmbedBuilder()
            .setColor(0xf60000)
            .setDescription(`❌ **No suggestions matched the filters provided.**`)
      ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.SelectMenuBuilder()
               .setCustomId(`view-suggestions:${type}:${id}:${index}`)
               .setPlaceholder(`Select a suggestion to view more on...`)
               .setOptions(
                  await Promise.all(
                     suggestions.map(async suggestion =>
                        new Discord.SelectMenuOptionBuilder()
                           .setLabel(createPreviewText(!isPartSuggestion ? suggestion.content : suggestion.name))
                           .setDescription((await interaction.client.users.fetch(suggestion.suggester)).tag)
                           .setValue(suggestion.id)
                           .setEmoji(`💬`)
                     )
                  )
               )
               .setDisabled(!suggestions.length)
         ]),

      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`view-suggestions:${type}:${id}:${+index - 1}`)
               .setEmoji(`⬅️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(+index - 1 < 0),
            new Discord.ButtonBuilder()
               .setCustomId(`view-suggestions:${type}:${id}:${+index + 1}`)
               .setEmoji(`➡️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(+index + 1 === length),
               new Discord.ButtonBuilder()
               .setCustomId(`this button shows the pages, that's it`)
               .setLabel(`${+index + 1} / ${length || 1}`)
               .setStyle(Discord.ButtonStyle.Secondary)
               .setDisabled(true)
         ])
   ];


   // edit the interaction's original reply
   return await interaction.editReply({
      embeds,
      components
   });
};