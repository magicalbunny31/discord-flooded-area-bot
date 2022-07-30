import Discord from "discord.js";
import { colours, emojis } from "@magicalbunny31/awesome-utility-stuff";

/**
 * bulk-view suggestions
 * @param {Discord.ButtonInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // button info
   const [ _button, id, index ] = interaction.customId.split(`:`);


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


   // get these ban results at the index
   const bannedResults = JSON.parse(await redis.LINDEX(`flooded-area:temporary-stuff:${id}`, +index));
   const length = await redis.LLEN(`flooded-area:temporary-stuff:${id}`);


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setDescription(
            bannedResults
               .map(bannedResult => `\\📛 \`${bannedResult.displayName}\` \\👤 \`@${bannedResult.name}\` \\🆔 \`${bannedResult.id}\``)
               .join(`\n`)
         )
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.SelectMenuBuilder()
               .setCustomId(`mod_show-ban-list:${id}:${index}`)
               .setPlaceholder(`Select a ban entry to view more on...`)
               .setOptions(
                  bannedResults.length
                     ? bannedResults.map(bannedResult =>
                        new Discord.SelectMenuOptionBuilder()
                           .setLabel(`📛 ${bannedResult.displayName} 👤 @${bannedResult.name}`)
                           .setDescription(`🆔 ${bannedResult.id}`)
                           .setValue(`${bannedResult.id}`)
                     )
                     : [
                        new Discord.SelectMenuOptionBuilder()
                           .setLabel(`owo`)
                           .setDescription(`hey! you're not supposed to see this! *bap*`)
                           .setValue(`owo`)
                     ]
               )
               .setDisabled(!bannedResults.length)
         ]),

      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`mod_show-ban-list:${id}:${+index - 1}`)
               .setEmoji(`⬅️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(+index - 1 < 0),
            new Discord.ButtonBuilder()
               .setCustomId(`mod_show-ban-list:${id}:${+index + 1}`)
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