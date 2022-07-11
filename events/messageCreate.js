export const name = `messageCreate`;
export const once = false;


import Discord from "discord.js";
import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Message} message
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (message, redis) => {
   // don't listen to partials
   if (message.partial)
      return;


   // id of user to listen to (in this case: magicalbunny31)
   const listenToId = `490178047325110282`;


   // don't listen to this message if this isn't magicalbunny31
   if (message.author.id !== listenToId)
      return;


   // this message has to first start mentioning the bot
   const [ prefix, command, ...args ] = message.content?.split(` `);

   if (!new RegExp(`^<@!?${message.client.user.id}>$`).test(prefix))
      return;


   // commands
   switch (command) {


      /**
       * send the initial suggestions message
       */
      case `send-suggestion-message`: {
         // delete the received message (if possible)
         if (message.deletable)
            await message.delete();

         // send the message to the same channel as the received message
         const embeds = [
            new Discord.EmbedBuilder()
               .setColor(0x4de94c)
               .setDescription(strip`
                  **__Welcome to <#983394106950684704>!__**

                  Submit any suggestions you have right here!
                  Your suggestions will be sent to the selected category's channel and will include your username#discriminator. 
                  Others members will be able to be able to view all suggestions and vote on them.
                  Don't abuse <#983394106950684704>: doing so may result in you being blacklisted from participating in suggestions.

                  You can further discuss individual suggestions by chatting in its corresponding thread.
                  The suggestion author and the <@&989125486590451732> are able to edit (their own) suggestions or delete them.
                  Only the <@&989125486590451732> are able to approve/deny or lock a suggestion.
               `),
            new Discord.EmbedBuilder()
               .setColor(0x4de94c)
               .setDescription(strip`
                  **__<#983394106950684704> are for your suggestions only.__**

                  Found an exploiter or abuser? Use <#995356930241470514> to report them.
                  Trying to appeal a ban? Submit it in <#988798222245953566>.
                  Got a bug to report? You should check out <#977295645603946597>.
                  Want to suggest a map? Do it in <#977297300567244801>.
               `)
         ];

         const components = [
            new Discord.ActionRowBuilder()
               .setComponents([
                  new Discord.SelectMenuBuilder()
                     .setCustomId(`suggestions`)
                     .setPlaceholder(`Select a suggestion to submit...`)
                     .setOptions([
                        {
                           label: `Game Suggestions`,
                           value: `game-suggestions`,
                           description: `Suggestions for Flooded Area on Roblox.`,
                           emoji: `<:Flood:983391790348509194>`
                        }, {
                           label: `Server Suggestions`,
                           value: `server-suggestions`,
                           description: `Suggestions for this Discord server.`,
                           emoji: `<:Discord:983413839573962752>`
                        }, {
                           label: `Part Suggestions`,
                           value: `part-suggestions`,
                           description: `Suggest a new part for Flooded Area on Roblox.`,
                           emoji: `<:Part:983414870970077214>`
                        }
                     ])
               ]),
            new Discord.ActionRowBuilder()
               .setComponents([
                  new Discord.ButtonBuilder()
                     .setCustomId(`view-your-suggestions`)
                     .setLabel(`View Your Suggestions`)
                     .setEmoji(emojis.flooded_area)
                     .setStyle(Discord.ButtonStyle.Primary),
                  new Discord.ButtonBuilder()
                     .setCustomId(`suggestions-tutorial`)
                     .setLabel(`Suggestions Tutorial`)
                     .setEmoji(emojis.flooded_area)
                     .setStyle(Discord.ButtonStyle.Secondary)
               ])
         ];

         return await message.channel.send({
            embeds,
            components
         });
      };


      case `demo`: {
         await message.delete();

         const m = await message.channel.send({
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(0xffee00)
                  .setAuthor({
                     name: message.author.tag,
                     iconURL: message.author.displayAvatarURL()
                  })
                  .setDescription(strip`
                     my suggestion lmao
                     filler textfiller textfiller textfiller textfiller textfiller textfiller textfiller textfiller textfiller textfiller textfiller text
                     foxfoxfoxfoxfoxfoxfoxfoxfoxfoxfoxfoxfoxfoxfoxfox
                  `)
            ]
         });

         await m.react(`⬆️`);
         await m.react(`⬇️`);

         const t = await m.startThread({
            name: `💬 "my suggestion lmao"`
         });

         await t.send({
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(0x4de94c)
                  .setTitle(`\\#️⃣ Suggestion Discussions`)
                  .setDescription(strip`
                     **\\🎫 Status**
                     > Approved by ${Discord.userMention(`490178047325110282`)} ${Discord.time(1657211713, Discord.TimestampStyles.RelativeTime)}.

                     **\\📝 Edits**
                     > [Edit](https://nuzzles.dev) from ${Discord.time(1657190113, Discord.TimestampStyles.RelativeTime)} by ${Discord.userMention(`490178047325110282`)}.
                     > [Edit](https://nuzzles.dev) from ${Discord.time(1657200913, Discord.TimestampStyles.RelativeTime)} by ${Discord.userMention(`330380239735750658`)}.
                  `)
            ],
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents([
                     new Discord.ButtonBuilder()
                        .setCustomId(`${m.id}:edit-suggestion`)
                        .setLabel(`Edit Suggestion`)
                        .setEmoji(`📝`)
                        .setStyle(Discord.ButtonStyle.Secondary)
                        .setDisabled(true)
                  ]),
               new Discord.ActionRowBuilder()
                  .setComponents([
                     new Discord.SelectMenuBuilder()
                        .setCustomId(`${m.id}:suggestion-settings`)
                        .setPlaceholder(`🔧 Suggestion Settings..`)
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
                              .setDescription(`Prevent further discussion in this thread and release votes.`)
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

         await t.members.add(message.author);
      };
   };
};