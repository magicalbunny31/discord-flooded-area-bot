import Discord from "discord.js";
import dayjs from "dayjs";

import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * demo of something and something blah blah, i don't know
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // only magicalbunny31 🐾 can use this command
   const magicalbunny31 = await redis.GET(`flooded-area:user:magicalbunny31`);

   if (interaction.user.id !== magicalbunny31)
      return await interaction.reply({
         content: strip`
            hello member with administrator permissions
            please ignore this command
            kthx ${emojis.happ}
         `,
         ephemeral: true
      });


   /**
    * there's probably a better way to do the code below
    * but i'm really lazy with this soo.. zzzzz
    * 🐰🦊🐺🦌
    */


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // stats
   const stats = await redis.HGETALL(`flooded-area:command:bun-stuff_suggestions-schedule-stats`);

   const gameSuggestions   = JSON.parse(stats[`game-suggestions`]);
   const serverSuggestions = JSON.parse(stats[`server-suggestions`]);
   const partSuggestions   = JSON.parse(stats[`part-suggestions`]);


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setTitle(`<:Flood:983391790348509194> game suggestions`)
         .setDescription(strip`
            🗓️ **dates**
            > started at ${Discord.time(Math.floor(gameSuggestions.startTimestamp / 1000))}
            > ended at ${Discord.time(Math.floor(gameSuggestions.endTimestamp / 1000))}
            > average time of \`${Math.round((Math.round(gameSuggestions.endTimestamp - gameSuggestions.startTimestamp) / 1000) / gameSuggestions.suggestionsMessagesFetched)} seconds\` per suggestion

            💬 **suggestion messages fetched**
            > \`${gameSuggestions.suggestionsMessagesFetched}\` suggestions
            > of which \`${gameSuggestions.falseSuggestionMessagesFetched}\` were false

            📭 **failed to fetch**
            > \`${gameSuggestions.failedToFetchSuggestionMessages}\` suggestion messages
            > \`${gameSuggestions.failedToFetchSettingsMessages}\` settings messages

            📝 **suggestions edited**
            > \`${gameSuggestions.suggestionEmbedsEdited}\` suggestion messages
            > \`${gameSuggestions.settingsEmbedsEdited}\` settings messages
         `),

      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setTitle(`<:Discord:983413839573962752> server suggestions`)
         .setDescription(strip`
            🗓️ **dates**
            > started at ${Discord.time(Math.floor(serverSuggestions.startTimestamp / 1000))}
            > ended at ${Discord.time(Math.floor(serverSuggestions.endTimestamp / 1000))}
            > average time of \`${Math.round((Math.round(serverSuggestions.endTimestamp - serverSuggestions.startTimestamp) / 1000) / serverSuggestions.suggestionsMessagesFetched)} seconds\` per suggestion

            💬 **suggestion messages fetched**
            > \`${serverSuggestions.suggestionsMessagesFetched}\` suggestions
            > of which \`${serverSuggestions.falseSuggestionMessagesFetched}\` were false

            📭 **failed to fetch**
            > \`${serverSuggestions.failedToFetchSuggestionMessages}\` suggestion messages
            > \`${serverSuggestions.failedToFetchSettingsMessages}\` settings messages

            📝 **suggestions edited**
            > \`${serverSuggestions.suggestionEmbedsEdited}\` suggestion messages
            > \`${serverSuggestions.settingsEmbedsEdited}\` settings messages
         `),

      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setTitle(`<:Part:983414870970077214> part suggestions`)
         .setDescription(strip`
            🗓️ **dates**
            > started at ${Discord.time(Math.floor(partSuggestions.startTimestamp / 1000))}
            > ended at ${Discord.time(Math.floor(partSuggestions.endTimestamp / 1000))}
            > average time of \`${Math.round((Math.round(partSuggestions.endTimestamp - partSuggestions.startTimestamp) / 1000) / partSuggestions.suggestionsMessagesFetched)} seconds\` per suggestion

            💬 **suggestion messages fetched**
            > \`${partSuggestions.suggestionsMessagesFetched}\` suggestions
            > of which \`${partSuggestions.falseSuggestionMessagesFetched}\` were false

            📭 **failed to fetch**
            > \`${partSuggestions.failedToFetchSuggestionMessages}\` suggestion messages
            > \`${partSuggestions.failedToFetchSettingsMessages}\` settings messages

            📝 **suggestions edited**
            > \`${partSuggestions.suggestionEmbedsEdited}\` suggestion messages
            > \`${partSuggestions.settingsEmbedsEdited}\` settings messages
         `)
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds
   });
};