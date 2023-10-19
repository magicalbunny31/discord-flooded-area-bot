export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";
import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

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


   // this is for AnySelectMenuInteraction
   if (!interaction.isAnySelectMenu())
      return;


   // member doesn't have the role needed to use commands
   if (!interaction.member.roles.cache.has(process.env.ROLE))
      return await interaction.reply({
         content: `### ${emojiError} woah there! you need have the ${Discord.roleMention(process.env.ROLE)} role to use these commands~`,
         ephemeral: true
      });


   // select menu information
   const [ selectMenu ] = interaction.customId.split(`:`);
   const [ value ] = interaction.values;


   // commands
   switch (selectMenu) {


      // help
      case `help`: {
         // commands
         const applicationCommands = await interaction.client.application.commands.fetch();
         const commandBanId        = applicationCommands.find(command => command.name === `ban`)    ?.id || 0;
         const commandKickId       = applicationCommands.find(command => command.name === `kick`)   ?.id || 0;
         const commandTempbanId    = applicationCommands.find(command => command.name === `tempban`)?.id || 0;
         const commandUnbanId      = applicationCommands.find(command => command.name === `unban`)  ?.id || 0;

         // respond to the interaction
         const showChatInput = value === `chat-input`;
         return await interaction.update({
            embeds: showChatInput
               ? [
                  new Discord.EmbedBuilder()
                     .setColor(embedColour)
                     .setTitle(`commands`)
                     .setDescription(strip`
                        ### ${Discord.chatInputApplicationCommandMention(`ban`, commandBanId)} __\`player\`__ (\`reason\`) (\`player2\` ...) (\`reban\`)
                        > - *permanently ban a player from flooded area*
                        >  - __\`player\`__: player to ban, you can add up to 10 players to ban
                        >  - (\`reason\`): reason to show in <#985567722878402570>, this isn't shown to the banned player
                        >  - (\`reban\`): should the player be unbanned first? (this will be ignored when multiple players are inputted)
                        > - example: "**${Discord.chatInputApplicationCommandMention(`ban`, commandBanId)} \`magicalbunny31\` \`exploiting\`**"

                        ### ${Discord.chatInputApplicationCommandMention(`kick`, commandKickId)} __\`player\`__ (\`reason\`)
                        > - *kick a player from a server in flooded area, if they are already in a server*
                        >  - __\`player\`__: player to kick
                        >  - (\`reason\`): reason to show in <#985567722878402570>, this isn't shown to the kicked player
                        > - example: "**${Discord.chatInputApplicationCommandMention(`kick`, commandKickId)} \`magicalbunny31\` \`being annoying\`**"

                        ### ${Discord.chatInputApplicationCommandMention(`tempban`, commandTempbanId)} __\`player\`__ __\`duration\`__ (\`reason\`) (\`player2\` ...) (\`retempban\`)
                        > - *temporarily ban a player from flooded area*
                        >  - __\`player\`__: player to temporarily ban, you can add up to 10 players to ban
                        >  - __\`duration\`__: duration for the ban, it can be in seconds (86400) or in number/durations (3d2h1m)
                        >  - (\`reason\`): reason to show in <#985567722878402570>, this isn't shown to the banned player
                        >  - (\`retempban\`): should the player be unbanned first? (this will be ignored when multiple players are inputted)
                        > - example: "**${Discord.chatInputApplicationCommandMention(`tempban`, commandTempbanId)} \`magicalbunny31\` \`1d\` \`false votekicking\`**"
               
                        ### ${Discord.chatInputApplicationCommandMention(`unban`, commandUnbanId)} __\`player\`__
                        > - *revoke a player's ban from flooded area*
                        >  - __\`player\`__: player's ban to revoke
                        > - example: "**${Discord.chatInputApplicationCommandMention(`unban`, commandUnbanId)} \`magicalbunny31\`**"
                     `)
               ]
               : [
                  new Discord.EmbedBuilder()
                     .setColor(embedColour)
                     .setTitle(`commands`)
                     .setDescription(strip`
                        ### ;ban __\`player\`__ (\`reason\`)
                        > - *permanently ban a player from flooded area*
                        >  - __\`player\`__: player to ban
                        >  - (\`reason\`): reason to show in <#985567722878402570>, this isn't shown to the banned player
                        > - example: "**;ban \`magicalbunny31\` \`exploiting\`**"
                        > - aliases: \`;b\`, \`;kill\`, \`;murder\`, \`;smite\`, \`;get\`
   
                        ### ;kick __\`player\`__ (\`reason\`)
                        > - *kick a player from a server in flooded area, if they are already in a server*
                        >  - __\`player\`__: player to kick
                        >  - (\`reason\`): reason to show in <#985567722878402570>, this isn't shown to the kicked player
                        > - example: "**;kick \`magicalbunny31\` \`being annoying\`**"
                        > - aliases: \`;k\`, \`;boot\`, \`;boop\`
   
                        ### ;massban __\`player1\`__ __\`player2\`__ __\`player3\`__ ..., (\`reason\`)
                        > - *permanently ban multiple players from flooded area under the same reason*
                        >  - __\`player\`__: player to ban, you can add up to 10 players to ban THEN add a "," to start the next arguments
                        >  - (\`reason\`): reason to show in <#985567722878402570>, this isn't shown to all of the banned players
                        > - example: "**;massban \`magicalbunny31\` \`magicalbunneh31\` \`fluffycinnabunfolf\` \`fcfolf\`, \`spreading misinformation\`**"
                        > - aliases: \`;mass-ban\`, \`;mass-b\`, \`;m-b\`, \`;massb\`, \`;mb\`, \`;mban\`
   
                        ### ;masstempban __\`player1\`__ __\`player2\`__ __\`player3\`__ ..., __\`duration\`__ (\`reason\`)
                        > - *temporarily ban multiple players from flooded area under the same reason*
                        >  - __\`player\`__: player to temporarily ban, you can add up to 10 players to ban THEN add a "," to start the next arguments
                        >  - __\`duration\`__: duration for the bans, it can be in seconds (86400) or in number/durations (3d2h1m)
                        >  - (\`reason\`): reason to show in <#985567722878402570>, this isn't shown to all of the banned players
                        > - example: "**;masstempban \`xXHaloEpicXx\` \`RapidRuby\` \`Snwgglez\` \`LemonVonEngineering\`, \`1h\` \`ganging up on me\`**"
                        > - aliases: \`;mass-tempban\`, \`;mass-tb\`, \`;m-tb\`, \`;masstb\`, \`;mtb\`, \`;mtempban\`
   
                        ### ;reban __\`player\`__ __\`duration\`__ (\`reason\`)
                        > - *unbans the player, then permanently bans them from flooded area*
                        >  - __\`player\`__: player to ban
                        >  - (\`reason\`): reason to show in <#985567722878402570>, this isn't shown to the banned player
                        > - example: "**;reban \`magicalbunny31\` \`exploiting\`**"
                        > - aliases: \`;re-ban\` \`;re-b\`, \`;reb\`
   
                        ### ;retempban __\`player\`__ __\`duration\`__ (\`reason\`)
                        > - *unbans the player, then temporarily bans them from flooded area*
                        >  - __\`player\`__: player to temporarily ban
                        >  - __\`duration\`__: duration for the ban, it can be in seconds (86400) or in number/durations (3d2h1m)
                        >  - (\`reason\`): reason to show in <#985567722878402570>, this isn't shown to the banned player
                        > - example: "**;retempban \`magicalbunny31\` \`259200\` \`false modcalling\`**"
                        > - aliases: \`;re-tempban\`, \`;re-tb\`, \`;retb\`
   
                        ### ;tempban __\`player\`__ __\`duration\`__ (\`reason\`)
                        > - *temporarily ban a player from flooded area*
                        >  - __\`player\`__: player to temporarily ban
                        >  - __\`duration\`__: duration for the ban, it can be in seconds (86400) or in number/durations (3d2h1m)
                        >  - (\`reason\`): reason to show in <#985567722878402570>, this isn't shown to the banned player
                        > - example: "**;tempban \`magicalbunny31\` \`1d\` \`false votekicking\`**"
                        > - aliases: \`;tb\`, \`;exile\`
   
                        ### ;unban __\`player\`__
                        > - *revoke a player's ban from flooded area*
                        >  - __\`player\`__: player's ban to revoke
                        > - example: "**;unban \`magicalbunny31\`**"
                        > - aliases: \`;ub\`, \`;revoke-ban\`, \`;revokeban\`, \`;rb\`, \`;pardon\`, \`;revive\`, \`;kiss\`
                     `)
                     .setFooter({
                        text: `valid prefixes: ";<command>", "@${interaction.client.user.username} <command>"`
                     }),
                  new Discord.EmbedBuilder()
                     .setColor(embedColour)
                     .setTitle(`chaining/bulk commands`)
                     .setDescription(strip`
                        commands can be chained by adding a new command to a new line, example below:
                        > \`\`\`
                        > ;ban magicalbunny31 exploiting
                        > ;kick magicalbunny31 being annoying
                        > ;massban magicalbunny31 magicalbunneh31 fluffycinnabunfolf fcfolf, spreading misinformation
                        > ;masstempban xXHaloEpicXx mimi RapidRuby Snwgglez LemonVonEngineering, 1h ganging up on me
                        > ;reban magicalbunny31 exploiting
                        > ;retempban magicalbunny31 259200 false modcalling
                        > ;tempban magicalbunny31 1d false votekicking
                        > ;unban magicalbunny31
                        > \`\`\`
                     `)
               ],
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.StringSelectMenuBuilder()
                        .setCustomId(`help`)
                        .setPlaceholder(`select a command format`)
                        .setOptions(
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(`slash commands`)
                              .setValue(`chat-input`)
                              .setEmoji(emojis.slash_command)
                              .setDefault(showChatInput),
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(`text-based commands`)
                              .setValue(`text-based`)
                              .setEmoji(emojis.active_threads)
                              .setDefault(!showChatInput)
                        )
                  )
            ],
            allowedMentions: {
               repliedUser: false
            }
         });
      };


   };
};