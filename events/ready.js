export const name = `ready`;
export const once = true;


import Discord from "discord.js";

/**
 * @param {Discord.Client} client
 */
export default async client => {
   // create commands in the Flooded Area Community discord server
   const commandsGuild = `977254354589462618`;
   client.application.commands.set([
      {
         name: `edit-suggestion`,
         description: `📝 Edit one of your suggestions.`,
         options: [{
            type: Discord.ApplicationCommandOptionType.String,
            name: `suggestion-message-id`,
            description: `🆔 The ID of the suggestion's message to edit.`,
            autocomplete: true,
            required: true
         }]
      }, {
         name: `delete-suggestion`,
         description: `❌ Delete one of your suggestions.`,
         options: [{
            type: Discord.ApplicationCommandOptionType.String,
            name: `suggestion-message-id`,
            description: `🆔 The ID of the suggestion's message to delete.`,
            autocomplete: true,
            required: true
         }]
      }
   ], commandsGuild);


   // log to console once everything is done
   console.log(`Flooded Area Suggestions 🌊 is ready~`);
};