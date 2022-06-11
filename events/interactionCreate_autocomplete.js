export const name = `interactionCreate`;
export const once = false;


import Discord from "discord.js";
import dayjs from "dayjs";
import fuzzysort from "fuzzysort";

/**
 * @param {Discord.Interaction} interaction
 */
export default async interaction => {
   // this file is for AutocompleteInteractions
   if (!interaction.isAutocomplete())
      return;


   // this user is banned from making suggestions
   if (interaction.member.roles.cache.has(`979489114153963560`))
      return await interaction.respond([]);


   // ids of the channels for each suggestion type
   const channelIds = {
      game:   `983391293583523881`,
      server: `983391792131108885`,
      part:   `983391983487815791`
   };


   // fetch each channel and get the ids of messages sent by this user
   const suggestions = [];

   for (const channelId in channelIds) {
      const channel = await interaction.guild.channels.fetch(channelIds[channelId]);
      const channelMessages = await channel.messages.fetch();
      const userMessages = channelMessages.filter(message => {
         const author = message?.embeds[0]?.data?.author.name;
         const authorId = author?.match(/\([^()]*\)/g)?.pop().slice(1, -1);
         return authorId === interaction.user.id;
      });
      const messages = userMessages.map(message => ({ inChannelName: `#${message.channel.name}`, messageId: message.id, sentAt: dayjs(message.createdTimestamp).utc().format(`DD MMMM YYYY [UTC]`) }));
      suggestions.push(...messages);
   };

   const choices = suggestions.map(suggestion =>
      ({
         name: `[ ${suggestion.messageId} ] 💬 ${suggestion.inChannelName} ⌚ ${suggestion.sentAt}`,
         value: suggestion.messageId
      })
   );


   // use fuzzy logic to sort the suggestions by input
   const input = interaction.options.getFocused();
   const sortedChoices = fuzzysort.go(input, choices, {
      threshold: -Infinity,
      limit: 25,
      allowTypo: true,
      keys: [ `name`, `value` ]
   }).map(choice => choice.obj);


   // respond to the interaction
   if (input) // there's an input, show matched choices
      return await interaction.respond(sortedChoices);
   else // there's no input, show the first twenty-five choices
      return await interaction.respond(choices.slice(0, 25));
};