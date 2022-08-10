import Discord from "discord.js";
import { strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * view a suggestion's edits
 * @param {Discord.SelectMenuInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // select menu info
   const [ _selectMenu, id, dbId, index ] = interaction.customId.split(`:`);
   const i = +interaction.values[0];


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


   // get this edit
   const edits = JSON.parse(await redis.LINDEX(`flooded-area:temporary-stuff:${dbId}`, +index));
   const edit = edits[i];
   const length = await redis.LLEN(`flooded-area:temporary-stuff:${dbId}`);


   // the editor
   const editor = await interaction.client.users.fetch(edit.editor);
   const editorIsInGuild = await userIsInGuild(edit.editor);


   // embeds
   const isPartSuggestion = `name` in edit && `description` in edit;
   const cumulativeVotes = edit.upvotes - edit.downvotes;

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
         .setColor(colour)
         .setAuthor({
            name: editor.tag,
            iconURL: editorIsInGuild ? editor.displayAvatarURL() : editor.defaultAvatarURL
         })
         .setImage(edit[`image-url`] || null)
         .setFooter({
            text: [
               (+index || 0) === length - 1 && i === edits.length - 1
                  ? [ `📄 ORIGINAL` ]
                  : [],
               `⬆️ ${edit.upvotes} | ${edit.downvotes} ⬇️`
            ]
               .join(`\n`)
         })
   ];

   if (!isPartSuggestion)
      embeds[0].setDescription(edit.content);
   else
      embeds[0].spliceFields(0, 0, {
         name: `PART NAME`,
         value: edit.name
      }, {
         name: `PART DESCRIPTION`,
         value: edit.description
      });


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`view-edits:${id}:${dbId}:${index}`)
               .setEmoji(`🔙`)
               .setStyle(Discord.ButtonStyle.Primary)
         ])
   ];


   // update the interaction
   return await interaction.update({
      embeds,
      components
   });
};