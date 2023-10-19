export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";
import fetch from "node-fetch";
import dayjs from "dayjs";
import { colours, set, strip } from "@magicalbunny31/awesome-utility-stuff";

import { readFile } from "fs/promises";
const pkg = JSON.parse(await readFile(`./package.json`));

/**
 * handles all interactions sent to the bot
 * @param {Discord.Interaction} interaction
 */
export default async interaction => {
   // constants
   const emojiLoading = `<a:ingame_moderation_loading:1123764375640080384>`;
   const emojiError   = `<a:ingame_moderation_error:1123766878167367770>`;

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


   // user-agent for requests
   const userAgent = `${pkg.name}/${pkg.version} (${process.env.GITHUB})`;


   // command data
   const commandData = [];


   // function to format a length to a human-readable string
   const formatDuration = lengthInSeconds => {
      const format = [];
      const duration = dayjs.duration(lengthInSeconds, `seconds`);

      const days = (duration.years() * 365) + (duration.months() * 30) + duration.days();

      if (duration.asDays()    >= 1) format.push(`${days} ${days === 1 ? `day` : `days`}`);
      if (duration.asHours()   >= 1) format.push(`${duration.hours()} ${duration.hours() === 1 ? `hour` : `hours`}`);
      if (duration.asMinutes() >= 1) format.push(`${duration.minutes()} ${duration.minutes() === 1 ? `minute` : `minutes`}`);
      if (duration.asSeconds() >= 1) format.push(`${duration.seconds()} ${duration.seconds() === 1 ? `second` : `seconds`}`);

      return format.join(`, `);
   };


   // function to create a commandData for this action and user
   const createCommandData = (action, commandName, player, reason, length) => {
      switch (action) {
         case `Ban`: return {
            commandName,
            player,
            action,
            ...length
               ? { length }
               : {},
            reason
         };
         case `Kick`: return {
            commandName,
            player,
            action,
            reason
         };
         case `Unban`: return {
            commandName,
            player,
            action
         };
      };
   };


   // command arguments
   const players = set([
      interaction.options.getInteger(`player`),
      interaction.options.getInteger(`player2`),
      interaction.options.getInteger(`player3`),
      interaction.options.getInteger(`player4`),
      interaction.options.getInteger(`player5`),
      interaction.options.getInteger(`player6`),
      interaction.options.getInteger(`player7`),
      interaction.options.getInteger(`player8`),
      interaction.options.getInteger(`player9`),
      interaction.options.getInteger(`player10`)
   ])
      .filter(Boolean);

   const length = interaction.options.getInteger(`duration`);

   const reason = interaction.options.getString(`reason`) || ``;

   const unbanFirst = (interaction.options.getString(`reban`) || interaction.options.getString(`retempban`)) === `true`;

   const isMassBan     = !!(interaction.commandName === `ban`     && players.length > 1);
   const isMassTempBan = !!(interaction.commandName === `tempban` && players.length > 1 && length);

   const isReBan     = !!(interaction.commandName === `ban`     && unbanFirst && players.length === 1);
   const isReTempBan = !!(interaction.commandName === `tempban` && unbanFirst && players.length === 1 && length);


   // the name of this command, equivalent to its text-based command
   const commandName = (() => {
      switch (true) {
         case isMassBan:     return `massban`;
         case isMassTempBan: return `masstempban`;
         case isReBan:       return `reban`;
         case isReTempBan:   return `retempban`;
         default:            return interaction.commandName;
      };
   })();


   // push this command data
   for (const player of players)
      commandData.push(
         ...!(unbanFirst && (isReBan || isReTempBan) && !(isMassBan || isMassTempBan))
            ? [
               createCommandData(
                  (() => {
                     switch (interaction.commandName) {
                        case `ban`:     return `Ban`;
                        case `kick`:    return `Kick`;
                        case `tempban`: return `Ban`;
                        case `unban`:   return `Unban`;
                     };
                  })(),
                  commandName,
                  player,
                  reason,
                  length
               )
            ]
            : [
               createCommandData(
                  `Unban`,
                  commandName,
                  player
               ),
               createCommandData(
                  `Ban`,
                  commandName,
                  player,
                  reason,
                  length
               )
            ]
      );


   // no player data
   if (!commandData.length)
      return;


   // respond to the interaction
   const interactionResponse = await interaction.reply({
      content: `### ${emojiLoading} fetching player data..`,
      fetchReply: true
   });


   // fetch player ids
   // https://users.roblox.com/docs#!/Users
   try {
      for (const data of commandData) {
         // send a http get request
         const response = await fetch(`https://users.roblox.com/v1/users/${data.player}`, {
            headers: {
               "Accept": `application/json`,
               "User-Agent": userAgent
            }
         });

         // player id not found
         if (response.status === 404)
            continue;

         // something else went wrong
         if (!response.ok)
            throw new Error(`https://users.roblox.com/v1/users/${data.player} : HTTP ${response.status} ${response.statusText}`);

         // the data from the request
         const responseData = await response.json();

         // map its data to the commandData
         if (responseData)
            data.player = {
               id:          responseData.id,
               displayName: responseData.displayName,
               username:    responseData.name
            };
      };


   } catch (error) {
      // edit the reply
      return await interaction.editReply({
         content: `### ${emojiError} an error occurred fetching player ids`,
         files: [
            new Discord.AttachmentBuilder()
               .setFile(
                  Buffer.from(error.stack)
               )
               .setName(`error-stack_${interaction.id}_${Math.floor(interaction.createdTimestamp / 1000)}.txt`)
         ],
         allowedMentions: {
            repliedUser: false
         }
      });
   };


   // map data that hasn't gotten a player to an error
   for (const data of commandData) {
      if (typeof data.player !== `number`)
         continue;

      data.error = `unknown player`;
      delete data.action;
      delete data.reason;
   };


   // fetch player avatar headshots
   // https://thumbnails.roblox.com/docs/index.html
   const playerIdsToFetchAvatar = commandData
      .filter(data => !data.error)
      .map(data => data.player.id);

   if (playerIdsToFetchAvatar.length)
      try {
         // send a http get request
         const response = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${playerIdsToFetchAvatar.join(`,`)}&size=720x720&format=Png&isCircular=false`, {
            headers: {
               "Accept": `application/json`,
               "User-Agent": userAgent
            }
         });

         // something went wrong
         if (!response.ok)
            throw new Error(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${playerIdsToFetchAvatar.join(`,`)}&size=720x720&format=Png&isCircular=false : HTTP ${response.status} ${response.statusText}`);

         // the data from the request
         const { data: responseData } = await response.json();

         // map its data with the commandData to also have an image url to their avatar headshot
         for (const data of commandData) {
            const avatarHeadshot = responseData.find(responseData => data.player?.id === responseData.targetId);
            if (avatarHeadshot)
               data.player.avatar = avatarHeadshot.imageUrl;
         };

      } catch (error) {
         // edit the reply
         return await interaction.editReply({
            content: `### ${emojiError} an error occurred fetching player avatar headshots`,
            files: [
               new Discord.AttachmentBuilder()
                  .setFile(
                     Buffer.from(error.stack)
                  )
                  .setName(`error-stack_${interaction.id}_${Math.floor(interaction.createdTimestamp / 1000)}.txt`)
            ],
            allowedMentions: {
               repliedUser: false
            }
         });
      };


   // embeds
   const applicationCommands      = await interaction.guild.commands.fetch();
   const applicationCommandHelpId = applicationCommands.find(command => command.name === `help`)?.id || 0;

   const embeds = commandData
      .map(data =>
         !data.error
            ? new Discord.EmbedBuilder()
               .setColor(embedColour)
               .setAuthor({
                  name: `${data.player.displayName} (@${data.player.username})`,
                  url: `https://www.roblox.com/users/${data.player.id}/profile`,
                  iconURL: data.player.avatar || null
               })
               .setDescription(`### ${emojiLoading} ${
                  {
                     "Ban":   `banning player..`,
                     "Kick":  `kicking player from server..`,
                     "Unban": `revoking player's ban..`
                  }[data.action]
               }`)
               .setFields(
                  ...data.length
                     ? [{
                        name: `length`,
                        value: `> ${formatDuration(data.length)}`,
                        inline: true
                     }]
                     : [],
                  ...data.reason
                     ? [{
                        name: `reason`,
                        value: `> ${data.reason}`,
                        inline: true
                     }]
                     : []
               )
               .setFooter({
                  text: data.commandName
               })
            : new Discord.EmbedBuilder()
               .setColor(colours.red)
               .setDescription(
                  {
                     "malformed command": strip`
                        ### ${emojiError} incorrect command format
                        > - use **${Discord.chatInputApplicationCommandMention(`help`, applicationCommandHelpId)}** or **;help** for __help on how to use this command__
                     `,
                     "invalid length": strip`
                        ### ${emojiError} incorrect length format
                        > - valid lengths is the time in __seconds__ (\`86400\` ➡️ 1 day) or as a __number/duration__ (\`1w2d3h4m5s\` ➡️ 1 week, 2 days, 3 hours, 4 minutes, 5 seconds)
                        > - lengths must also be __at least 1 second__
                     `,
                     "unknown player": strip`
                        ### ${emojiError} unknown player "${data.player}"
                        > - input a player's __roblox username__ or __player id__
                        > - or, ${Discord.hyperlink(`roblox may be having an outage`, `https://status.roblox.com`)} right now
                     `
                  }[data.error]
               )
               .setFooter({
                  text: data.commandName
               })
      );


   // edit the command's reply
   await interaction.editReply({
      content: null,
      embeds,
      allowedMentions: {
         repliedUser: false
      }
   });


   // push the commandData to the moderations array
   interaction.client.moderations.push(
      ...commandData
         .filter(data => !data.error)
         .map((data, i) =>
            ({
               method: data.action, // what action the server will take on this player
               reason: data.reason, // the reason to display in the moderation logs
               ...data.length       // length in seconds to ban this player for
                  ? { length: data.length }
                  : {},

               value:       data.player.id,          // player (id)           to moderate
               displayName: data.player.displayName, // player (display name) to moderate
               username:    data.player.username,    // player (username)     to moderate
               avatar:      data.player.avatar,      // image url to player's avatar headshot

               guild:      interaction.guild.id,   // this guild's id
               channel:    interaction.channel.id, // this channel's id
               message:    interactionResponse.id, // this message's id
               embedindex: i,                      // the index of the embed for this action in the message

               moderator: interaction.user.id // the id of the moderator who sent this moderation
            })
         )
   );
};