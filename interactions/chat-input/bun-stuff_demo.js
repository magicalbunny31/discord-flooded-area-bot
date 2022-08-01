import Discord from "discord.js";
import { colours, emojis, set, strip } from "@magicalbunny31/awesome-utility-stuff";

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


   const toHuman = array => array.concat(array.splice(-2, 2).join(` and `)).join(`, `);

   const suggestionId = interaction.channel.id;
   const suggestion = await redis.HGETALL(`flooded-area:server-suggestions:${suggestionId}`);

   const editors = set(JSON.parse(suggestion.edits).map(edit => Discord.userMention(edit.editor)));
   const lastEdit = JSON.parse(suggestion.edits).at(-1);

   await interaction.reply({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setDescription(strip`
               **🎫 Status**
               > Open for discussion since deez.

               **✏️ Editors**
               > Edited by ${toHuman(editors)}
               > Last edited by ${Discord.userMention(lastEdit.editor)} ${Discord.time(Math.floor(lastEdit[`edit-timestamp`] / 1000), Discord.TimestampStyles.RelativeTime)}
            `)
      ],
      components: [
         new Discord.ActionRowBuilder()
            .setComponents([
               new Discord.ButtonBuilder()
                  .setCustomId(`edit-suggestion:${suggestionId}`)
                  .setLabel(`Edit Suggestion`)
                  .setEmoji(`📝`)
                  .setStyle(Discord.ButtonStyle.Secondary),
               new Discord.ButtonBuilder()
                  .setCustomId(`view-edits:${suggestionId}`)
                  .setLabel(`View Edits`)
                  .setEmoji(`📃`)
                  .setStyle(Discord.ButtonStyle.Secondary)
            ]),
         new Discord.ActionRowBuilder()
            .setComponents([
               new Discord.SelectMenuBuilder()
                  .setCustomId(`suggestion-settings:${suggestionId}`)
                  .setPlaceholder(`Suggestion Settings...`)
                  .setOptions([
                     new Discord.SelectMenuOptionBuilder()
                        .setLabel(`Change Status`)
                        .setDescription(`Approve/deny this suggestion and lock this thread.`)
                        .setValue(`change-status`)
                        .setEmoji(`🎫`),
                     new Discord.SelectMenuOptionBuilder()
                        .setLabel(`Lock Suggestion`)
                        .setDescription(`Lock votes and this thread.`)
                        .setValue(`lock-suggestion`)
                        .setEmoji(`🔒`),
                     new Discord.SelectMenuOptionBuilder()
                        .setLabel(`Delete Suggestion`)
                        .setDescription(`Delete suggestion and this thread.`)
                        .setValue(`delete-suggestion`)
                        .setEmoji(`🗑️`)
                  ])
            ])
      ]
   });
};