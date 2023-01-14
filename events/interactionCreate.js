export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";

/**
 * handles all interactions sent to the bot
 * @param {Discord.Interaction} interaction
 */
export default async interaction => {
   switch (true) {


      // this is a chat-input application command (slash command)
      case interaction.isChatInputCommand(): {
         // member doesn't have the role needed to use commands
         if (!interaction.member.roles.cache.has(process.env.ROLE))
            return await interaction.reply({
               content: `❌ **You do not have permission to use this command.**`,
               ephemeral: true
            });


         // get this command's file
         const file = await import(`../commands/chat-input/${interaction.commandName}.js`);


         try {
            // run the command for this file
            return await file.default(interaction);

         } catch (error) {
            // log this error
            console.error(error);

            // try and edit the interaction
            const payload = {
               content: `❌ **An error occurred.**`,
               embeds: [],
               components: [],
               files: []
            };

            try {
               // try to send the initial reply to the interaction
               await interaction.reply(payload);

            } catch {
               // try to edit the interaction's original reply
               await interaction.editReply(payload);

            } finally {
               // stop here
               return;
            };
         };
      };


      // this is an autocomplete interaction
      case interaction.isAutocomplete(): {
         // get this command's file
         const { name } = interaction.options.getFocused(true);
         const file = await import(`../autocomplete/${name}.js`);


         try {
            // run the command for this file
            return await file.default(interaction);

         } catch (error) {
            // log this error
            return console.error(error);
         };
      };


   };
};