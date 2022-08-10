import Discord from "discord.js";
import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * view a suggestion's edits
 * @param {Discord.ButtonInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // button info
   const [ _button, id, dbId, index ] = interaction.customId.split(`:`);


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


   // this is the initial interaction
   const isInitialInteraction = !(dbId && index);


   // disable components
   if (!isInitialInteraction) {
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
   };


   // defer the interaction
   if (isInitialInteraction)
      // send the initial interaction
      await interaction.deferReply({
         ephemeral: true
      });

   else
      // disable the components
      await interaction.update({
         components: interaction.message.components
      });


   // what type of suggestion this suggestion is exactly
   const rawChannelIds = await redis.HGETALL(`flooded-area:channel:suggestions`);                   // channel ids for each suggestion
   const channelTypes  = Object.fromEntries(Object.entries(rawChannelIds).map(id => id.reverse())); // reverse the object's keys with its values
   const type          = channelTypes[interaction.channel.parent.id];                               // use the channel id to find the object's key (the suggestion type)


   // get this suggestion's edits
   const edits = isInitialInteraction
      ? await (async () => {
         // get edits
         let edits = JSON.parse(await redis.HGET(`flooded-area:${type}:${id}`, `edits`)).slice().reverse();

         // split the edits array into chunks of 5
         const size = 5;
         edits = Array.from(
            new Array(Math.ceil(edits.length / size)),
            (_element, i) => edits.slice(i * size, i * size + size)
         );

         // temporarily set the suggestions array in the database in order for the menu to work
         await redis
            .multi()
            .RPUSH(`flooded-area:temporary-stuff:${interaction.id}`, edits.map(edit => JSON.stringify(edit)))
            .EXPIRE(`flooded-area:temporary-stuff:${interaction.id}`, 86400)
            .exec();

         // return the edits at the first index
         return edits[0];
      })()

      : JSON.parse(await redis.LINDEX(`flooded-area:temporary-stuff:${dbId}`, +index));

   const length = await redis.LLEN(`flooded-area:temporary-stuff:${dbId || interaction.id}`);


   // embeds
   const isPartSuggestion = type === `part-suggestions`;

   const embeds = await Promise.all(
      edits.map(async (edit, i) =>
         new Discord.EmbedBuilder()
            .setColor(getColour(edit.upvotes, edit.downvotes))
            .setDescription(strip`
               **${await userIsInGuild(edit.editor) ? Discord.userMention(edit.editor) : (await interaction.client.users.fetch(edit.editor)).tag} at ${Discord.time(Math.floor(edit[`created-timestamp`] / 1000))}**
               > ${createPreviewText(!isPartSuggestion ? edit.content : edit.name)}
               > ⬆️ ${edit.upvotes} | ${edit.downvotes} ⬇️
            `)
            .setFooter({
               text: (+index || 0) === length - 1 && i === edits.length - 1
                  ? `📄 ORIGINAL`
                  : null
            })
      )
   );


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.SelectMenuBuilder()
               .setCustomId(`view-edits:${id}:${dbId || interaction.id}:${+index || 0}`)
               .setPlaceholder(`Select an edit to view more on...`)
               .setOptions(
                  await Promise.all(
                     edits.map(async (edit, i) =>
                        new Discord.SelectMenuOptionBuilder()
                           .setLabel(createPreviewText(Discord.cleanContent(!isPartSuggestion ? edit.content : edit.name, interaction.channel)))
                           .setDescription((await interaction.client.users.fetch(edit.editor)).tag)
                           .setValue(`${i}`)
                           .setEmoji(`📃`)
                     )
                  )
               )
         ]),

      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`view-edits:${id}:${dbId || interaction.id}:${(+index || 0) - 1}`)
               .setEmoji(`⬅️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled((+index || 0) - 1 < 0),
            new Discord.ButtonBuilder()
               .setCustomId(`view-edits:${id}:${dbId || interaction.id}:${(+index || 0) + 1}`)
               .setEmoji(`➡️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled((+index || 0) + 1 === length),
               new Discord.ButtonBuilder()
               .setCustomId(`this button shows the pages, that's it`)
               .setLabel(`${(+index || 0) + 1} / ${length || 1}`)
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