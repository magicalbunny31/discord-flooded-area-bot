export const name = `messageCreate`;
export const once = false;


import Discord from "discord.js";

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
   const [ prefix, command ] = message.content?.split(` `);

   if (!new RegExp(`^<@!?${message.client.user.id}>$`).test(prefix))
      return;


   // commands
   switch (command) {

      case `send-suggestion-message`:
         const embeds = [
            new Discord.EmbedBuilder()
               .setColor(0x4de94c)
               .setTitle(`Suggestions`)
               .setDescription(`You may submit any suggestions you have using this channel, through the bot. Your suggestions will be sent to the selected category with your name attached to it and will be able to be seen by anyone in the server, for them to vote on. Please submit your suggestion to the according category and remember not to put in any joke suggestions (or you may get prohibited from using the bot).`)
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
};