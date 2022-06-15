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


      /**
       * adds the "💬 Create Discussion Thread" to older suggestion messages
       */
      case `add-button`: {
         const [ inChannelId, messageId ] = args;

         // add the button to the message
         const guild   = await message.client.guilds.fetch(`977254354589462618`);
         const channel = await guild.channels.fetch(inChannelId);
         const m       = await channel.messages.fetch(messageId);

         return await m.edit({
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
      };


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

         return await message.channel.send({
            embeds,
            components
         });
      };


   };
};