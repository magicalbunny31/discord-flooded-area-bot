import Discord from "discord.js";
import { strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * show a modal to the user for them to submit a suggestion
 * @param {Discord.SelectMenuInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // select menu info
   const [ _selectMenu, type, dbId, index ] = interaction.customId.split(`:`);
   const [ id ] = interaction.values;


   // get this suggestion
   const suggestion = await redis.HGETALL(`flooded-area:${type}:${id}`);


   // the suggestion author
   const suggester = await interaction.client.users.fetch(suggestion.suggester);


   // embeds
   const isPartSuggestion = type === `part-suggestions`;
   const cumulativeVotes = +suggestion.upvotes - +suggestion.downvotes;

   const colour = (() => {
      const positiveColours = [ 0xfaee00, 0xedef00, 0xd8ef04, 0xc0ee16, 0xa5ee26, 0x88ec35, 0x6deb41, 0x57e949, 0x4de94c ];
      const neutralColour   =   0xffee00;
      const negativeColours = [ 0xffe800, 0xffd800, 0xffc100, 0xffa400, 0xff8400, 0xff6300, 0xfc4100, 0xf81e00, 0xf60000 ];

      return cumulativeVotes === 0
         ? neutralColour
         : cumulativeVotes > 0
            ? positiveColours[         cumulativeVotes ] || positiveColours[8]
            : negativeColours[Math.abs(cumulativeVotes)] || negativeColours[8];
   })();

   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(
            [ `approved`, `denied` ].includes(suggestion.status)
               ? suggestion.status === `approved` ? 0x4de94c : 0xf60000
               : colour
         )
         .setAuthor({
            name: suggester.tag,
            iconURL: suggester.displayAvatarURL()
         })
         .setImage(suggestion[`image-url`] || null)
         .setFooter({
            text: [
               ...[ `approved`, `denied` ].includes(suggestion.status)
                  ? [ `${suggestion.status.toUpperCase()} ${suggestion.status === `approved` ? `✅` : `❎`}` ] : [],
               ...cumulativeVotes >= 10
                  ? [ `POPULAR! 🎉` ] : [],
               ...suggestion.deleted === `true`
                  ? [ `DELETED 🗑️` ]
                  : suggestion.locked === `true`
                     ? [ `VOTES LOCKED 🔒` ] : [],
               `⬆️ ${suggestion.upvotes} | ${suggestion.downvotes} ⬇️`
            ]
               .join(`\n`)
         })
   ];

   if (!isPartSuggestion)
      embeds[0].setDescription(suggestion.content);
   else
      embeds[0].spliceFields(0, 0, {
         name: `PART NAME`,
         value: suggestion.name
      }, {
         name: `PART DESCRIPTION`,
         value: suggestion.description
      });


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`view-suggestions:${type}:${dbId}:${index}`)
               .setEmoji(`🔙`)
               .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
               .setLabel(`View suggestion message`)
               .setEmoji(`🔗`)
               .setStyle(Discord.ButtonStyle.Link)
               .setURL(suggestion[`message-url`] || `https://nuzzles.dev`)
               .setDisabled(suggestion.deleted === `true`)
         ])
   ];


   // update the interaction
   return await interaction.update({
      embeds,
      components
   });
};