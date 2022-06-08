export const name = `messageCreate`;
export const once = false;


import Discord from "discord.js";
import { strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Message} message
 */
export default async message => {
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


      case `add-button`: {
         const [ inChannelId, messageId ] = args;

         const guild   = await message.client.guilds.fetch(`977254354589462618`);
         const channel = await guild.channels.fetch(inChannelId);
         const m       = await channel.messages.fetch(messageId);

         await m.edit({
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents([
                     new Discord.ButtonBuilder()
                        .setCustomId(`create-discussion-thread`)
                        .setLabel(`Create Discussion Thread`)
                        .setStyle(Discord.ButtonStyle.Primary)
                        .setEmoji(`💬`)
                  ])
            ]
         });

         return;
      };


      case `send-suggestion-message`: {
         const embeds = [
            new Discord.EmbedBuilder()
               .setColor(0x4de94c)
               .setDescription(strip`
                  **Welcome to <#983394106950684704>!**

                  Submit any suggestions you have, through ${message.client.user} right here!
                  Your suggestions will be sent to the selected category's channel and will include your username. 
                  Others will be able to be able to view all suggestions and vote on them.
                  Please allocate your suggestions in the correct categories and don't yield any joke suggestions: doing so may result in being blacklisted from this channel.

                  You may further discuss individual suggestions by pressing the "💬 **Create Discussion Thread**" button.
                  To edit one of your suggestions, use the command **/edit-suggestion** with ${message.client.user}.
                  Similarly, to delete one of your suggestions, use the command **/delete-suggestion** with ${message.client.user}.
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
                           value: `game`,
                           description: `General suggestions for the game.`,
                           emoji: `<:Flood:983391790348509194>`
                        }, {
                           label: `Server Suggestions`,
                           value: `server`,
                           description: `General suggestions for the server.`,
                           emoji: `<:Discord:983413839573962752>`
                        }, {
                           label: `Part Suggestions`,
                           value: `part`,
                           description: `Request a new type of part or function.`,
                           emoji: `<:Part:983414870970077214>`
                        }
                     ])
               ])
         ];

         await message.channel.send({
            embeds,
            components
         });

         if (message.deletable)
            await message.delete();

         return;
      };


      case `demo-threads`: {
         await message.channel.send({
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(0x4de94c)
                  .setAuthor({
                     name: `${message.author.tag}\n(${message.author.id})`,
                     iconURL: message.author.displayAvatarURL()
                  })
                  .setDescription(`this is a suggestion`)
            ],
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents([
                     new Discord.ButtonBuilder()
                        .setCustomId(`create-discussion-thread`)
                        .setLabel(`Create Discussion Thread`)
                        .setStyle(Discord.ButtonStyle.Primary)
                        .setEmoji(`💬`)
                  ])
            ]
         });

         if (message.deletable)
            await message.delete();

         return;
      };


      case `demo-votes`: {
         /**
          * down:    [ #f60000, #f81e00, #fc4100, #ff6300, #ff8400, #ffa400, #ffc100, #ffd800, #ffe800 ]
          * neutral: [ #ffee00 ]
          * up:      [ #faee00, #edef00, #d8ef04, #c0ee16, #a5ee26, #88ec35, #6deb41, #57e949, #4de94c ]
          */

          const m = await message.channel.send({
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(0x4de94c)
                  .setAuthor({
                     name: `${message.author.tag}\n(${message.author.id})`,
                     iconURL: message.author.displayAvatarURL()
                  })
                  .setDescription(`this suggestion is very awesome`)
                  .setFooter({
                     text: `POPULAR! 🎉`
                  })
            ],
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents([
                     new Discord.ButtonBuilder()
                        .setCustomId(`create-discussion-thread`)
                        .setLabel(`Create Discussion Thread`)
                        .setStyle(Discord.ButtonStyle.Primary)
                        .setEmoji(`💬`)
                  ])
            ]
         });

         await m.react(`⬆️`);
         await m.react(`⬇️`);

         if (message.deletable)
            await message.delete();

         return;
      };


      case `demo-image`: {
         await message.channel.send({
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(0xffee00)
                  .setAuthor({
                     name: `${message.author.tag}\n(${message.author.id})`,
                     iconURL: message.author.displayAvatarURL()
                  })
                  .setDescription(`suggestion`)
                  .setImage(`https://foxrudor.de/?aaaaaaaaa=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`)
            ]
         });

         if (message.deletable)
            await message.delete();

         return;
      };


   };
};