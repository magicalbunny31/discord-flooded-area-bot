export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";
import { emojis } from "@magicalbunny31/awesome-utility-stuff";

import { readFile } from "fs/promises";
const pkg = JSON.parse(await readFile(`./package.json`));

/**
 * handles all interactions sent to the bot
 * @param {Discord.Interaction} interaction
 */
export default async interaction => {
   // constants
   const emojiError = `<a:ingame_moderation_error:1123766878167367770>`;

   const embedColour = 0x4c6468;


   // this is for ChatInputCommandInteractions
   if (!interaction.isChatInputCommand())
      return;


   // member doesn't have the role needed to use commands
   if (!interaction.member.roles.cache.has(process.env.ROLE))
      return await interaction.reply({
         content: `### ${emojiError} woah there! you need have the ${Discord.roleMention(process.env.ROLE)} role to use these commands~`,
         ephemeral: true
      });


   // command information
   const commandName = interaction.commandName;


   // commands
   switch (commandName) {


      // help
      case `help`: {
         return await interaction.reply({
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.StringSelectMenuBuilder()
                        .setCustomId(`help`)
                        .setPlaceholder(`🦊 select an option..`)
                        .setOptions(
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(`slash commands`)
                              .setValue(`chat-input`)
                              .setEmoji(emojis.slash_command),
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(`text-based commands`)
                              .setValue(`text-based`)
                              .setEmoji(emojis.active_threads)
                        )
                  )
            ]
         });
      };


   };
};