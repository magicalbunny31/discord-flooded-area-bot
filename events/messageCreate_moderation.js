export const name = Discord.Events.MessageCreate;
export const once = false;


import Discord from "discord.js";
import fetch from "node-fetch";
import dayjs from "dayjs";
import { colours, set, strip } from "@magicalbunny31/awesome-utility-stuff";

import { readFile } from "fs/promises";
const pkg = JSON.parse(await readFile(`./package.json`));

/**
 * handles all messages sent to a channel that the bot can see
 * @param {Discord.Message} message
 */
export default async message => {
   // constants
   const emojiLoading = `<a:ingame_moderation_loading:1123764375640080384>`;
   const emojiWarning = `<a:ingame_moderation_warning:1123791966803611719>`;
   const emojiError   = `<a:ingame_moderation_error:1123766878167367770>`;

   const embedColour = 0x4c6468;


   // user-agent for requests
   const userAgent = `${pkg.name}/${pkg.version} (${process.env.GITHUB})`;


   // ignore bots and webhooks
   if (message.author.bot || message.webhookId)
      return;


   // member doesn't have the role needed to use commands
   if (!message.member.roles.cache.has(process.env.ROLE))
      return;


   // moderation commands (and their aliases) for this file
   const commands = [{
      commandName:   `ban`,
      acceptedNames: [ `ban`, `b`, `kill`, `murder`, `smite`, `get` ]
   }, {
      commandName:   `kick`,
      acceptedNames: [ `kick`, `k`, `boot`, `boop` ]
   }, {
      commandName:   `massban`,
      acceptedNames: [ `massban`, `mass-ban`, `mass-b`, `m-b`, `massb`, `mb`, `mban` ]
   }, {
      commandName:   `masstempban`,
      acceptedNames: [ `masstempban`, `mass-tempban`, `mass-tb`, `m-tb`, `masstb`, `mtb`, `mtempban` ]
   }, {
      commandName:   `reban`,
      acceptedNames: [ `reban`, `re-ban`, `re-b`, `reb` ]
   }, {
      commandName:   `retempban`,
      acceptedNames: [ `retempban`, `re-tempban`, `re-tb`, `retb` ]
   }, {
      commandName:   `tempban`,
      acceptedNames: [ `tempban`, `tb`, `exile` ]
   }, {
      commandName:   `unban`,
      acceptedNames: [ `unban`, `ub`, `revoke-ban`, `revokeban`, `rb`, `pardon`, `revive`, `kiss` ]
   }];


   // command data
   const commandData = [];


   // function to parse a length string into a length in seconds
   const parseLength = rawLength => {
      // the length in seconds
      let length = 0;

      if (!isNaN(+rawLength)) { // the argument is the length in seconds
         length = +rawLength;

      } else { // no, the length isn't in seconds! parse it
         const splitTimes = [ ...rawLength?.matchAll(/[0-9]+[a-z]/g) || [] ].map(match => match[0]);
         for (const splitTime of splitTimes) {
            const [ unitLength, unit ] = [ ...splitTime.matchAll(/[0-9]+|[a-z]/g) ].map(match => match[0]);
            switch (unit) {
               case `s`: length += +unitLength;          break;
               case `m`: length += +unitLength *     60; break;
               case `h`: length += +unitLength *   3600; break;
               case `d`: length += +unitLength *  86400; break;
               case `w`: length += +unitLength * 604800; break;
            };
         };
      };

      // return the length (in seconds)
      return length;
   };


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


   // split the message by its lines (filtering out empty lines too)
   const commandContents = message.content.split(/\r?\n+/gm);


   // for each commandContents..
   for (const commandContent of commandContents) {
      // this isn't a command
      const lowerCaseCommandContent = commandContent.toLowerCase();
      const prefixRegexp = new RegExp(`^(<@!?${message.client.user.id}>|;)\\s*`);

      if (!prefixRegexp.test(lowerCaseCommandContent))
         return;


      // command information
      const [ _, matchedPrefix ] = lowerCaseCommandContent.match(prefixRegexp);
      const [ commandName, ...args ] = lowerCaseCommandContent.slice(matchedPrefix.length).trim().split(/ +/);


      // what command this is
      const command = commands.find(command => command.acceptedNames.includes(commandName));

      if (!command)
         continue;


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


      // do different stuff depending on the command
      switch (true) {


         case [ `ban`, `kick`, `tempban`, `unban`, `reban`, `retempban` ].includes(command.commandName): {
            // command arguments
            const [ player, rawLength ] = args;

            const length = [ `tempban`, `retempban` ].includes(command.commandName)
               ? parseLength(rawLength)
               : false;

            const reason = commandContent
               .slice(
                  length
                     ? (commandContent.indexOf(` ${rawLength} `) !== -1 ? commandContent.indexOf(` ${rawLength} `) : commandContent.lastIndexOf(` ${rawLength}`)) + (rawLength?.length || 0) + 2
                     : lowerCaseCommandContent.indexOf(player) + player?.length
               )
               .trim();


            // no player
            if (!player) {
               commandData.push({
                  commandName: command.commandName,
                  error: `malformed command`
               });

               break;
            };


            // length less than or equal to 0 or not valid
            if (length !== false && length <= 0) {
               commandData.push({
                  commandName: command.commandName,
                  error: `invalid length`
               });

               break;
            };


            // push this command data
            commandData.push(
               ...[ `ban`, `kick`, `tempban`, `unban` ].includes(command.commandName)
                  ? [
                     createCommandData(
                        (() => {
                           switch (command.commandName) {
                              case `ban`:     return `Ban`;
                              case `kick`:    return `Kick`;
                              case `tempban`: return `Ban`;
                              case `unban`:   return `Unban`;
                           };
                        })(),
                        command.commandName,
                        player,
                        reason,
                        length
                     )
                  ]
                  : [
                     createCommandData(
                        `Unban`,
                        command.commandName,
                        player
                     ),
                     createCommandData(
                        `Ban`,
                        command.commandName,
                        player,
                        reason,
                        length
                     )
                  ]
            );


            // break out
            break;
         };


         case [ `massban`, `masstempban` ].includes(command.commandName): {
            // command arguments
            const [ rawPlayers, args ] = commandContent.slice(commandContent.indexOf(commandName) + commandName.length).split(`,`);

            const players = set(
               rawPlayers.trim().split(/ +/)
            );

            const [ rawLength ] = args?.trim().split(/ +/) || [];
            const length = [ `masstempban` ].includes(command.commandName)
               ? parseLength(rawLength)
               : false;

            const reason = commandContent.includes(`,`)
               ? commandContent
                  .slice(
                     length
                        ? (commandContent.search(/, *[0-9]*/) !== -1 ? commandContent.search(/, *[0-9]*/) : commandContent.search(/, *[0-9]*/)) + (rawLength?.length || 0) + 2
                        : commandContent.indexOf(`,`) + `,`.length
                  )
                  .trim()
               : ``;


            // no player
            if (!rawPlayers) {
               commandData.push({
                  commandName: command.commandName,
                  error: `malformed command`
               });

               break;
            };


            // length less than or equal to 0 or not valid
            if (length !== false && length <= 0) {
               commandData.push({
                  commandName: command.commandName,
                  error: `invalid length`
               });

               break;
            };


            // push this command data
            for (const player of players) {
               commandData.push(
                  createCommandData(
                     `Ban`,
                     command.commandName,
                     player,
                     reason,
                     length
                  )
               );
            };


            // break out
            break;
         };


      };
   };


   // no player data
   if (!commandData.length)
      return;


   // too many players
   if (commandData.length > 10)
      return await message.reply({
         content: `### ${emojiError} up to 10 players can be moderated at once!`,
         allowedMentions: {
            repliedUser: false
         }
      });


   // reply to the message
   const commandReply = await message.reply({
      content: `### ${emojiLoading} fetching player data..`,
      allowedMentions: {
         repliedUser: false
      }
   });


   // players to fetch
   const playerUsernamesToFetch = commandData
      .filter(data => data.player)
      .map(data => data.player);

   const playerIdsToFetch = playerUsernamesToFetch
      .filter(player => !isNaN(+player));


   // fetch player usernames
   // https://users.roblox.com/docs#!/Users
   try {
      // send a http post request
      const response = await fetch(`https://users.roblox.com/v1/usernames/users`, {
         method: `POST`,
         headers: {
            "Accept": `application/json`,
            "Content-Type": `application/json`,
            "User-Agent": userAgent
         },
         body: JSON.stringify({
            usernames: playerUsernamesToFetch
         })
      });

      // something went wrong
      if (!response.ok)
         throw new Error(`https://users.roblox.com/v1/usernames/users : HTTP ${response.status} ${response.statusText}`);

      // the data from the request
      const { data: responseData } = await response.json();

      // map its data with the commandData from the playerUsernamesToFetch
      for (const playerUsername of playerUsernamesToFetch) {
         const data       = commandData .find(commandData => commandData.player === playerUsername);
         const playerData = responseData.find(responseData => responseData.name.toLowerCase() === data.player.toLowerCase());
         if (playerData)
            data.player = {
               id:          playerData.id,
               displayName: playerData.displayName,
               username:    playerData.name
            };
      };


   } catch (error) {
      // edit the reply
      return await commandReply.edit({
         content: `### ${emojiError} an error occurred fetching player usernames`,
         files: [
            new Discord.AttachmentBuilder()
               .setFile(
                  Buffer.from(error.stack)
               )
               .setName(`error-stack_${message.id}_${Math.floor(message.createdTimestamp / 1000)}.txt`)
         ],
         allowedMentions: {
            repliedUser: false
         }
      });
   };


   // fetch player ids
   // https://users.roblox.com/docs#!/Users
   try {
      for (const playerId of playerIdsToFetch) {
         // send a http get request
         const response = await fetch(`https://users.roblox.com/v1/users/${playerId}`, {
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
            throw new Error(`https://users.roblox.com/v1/users/${playerId} : HTTP ${response.status} ${response.statusText}`);

         // the data from the request
         const dataIfId       = await response.json();
         const dataIfUsername = commandData.find(commandData => commandData.player.username === playerId);

         // prompt the user if this is an id or a username
         if (dataIfId && dataIfUsername) {
            await commandReply.edit({
               content: `### ${emojiWarning} is "${playerId}" a __roblox username__ or __player id__?`,
               components: [
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.StringSelectMenuBuilder()
                           .setCustomId(`${message.id}:prompt-select-user`)
                           .setPlaceholder(`🦊 select an option..`)
                           .setOptions(
                              new Discord.StringSelectMenuOptionBuilder()
                                 .setLabel(`roblox username`)
                                 .setValue(`${dataIfUsername.player.id}`)
                                 .setDescription(`${dataIfUsername.player.displayName} (@${dataIfUsername.player.username})`)
                                 .setEmoji(`📛`),
                              new Discord.StringSelectMenuOptionBuilder()
                                 .setLabel(`player id`)
                                 .setValue(`${dataIfId.id}`)
                                 .setDescription(`${dataIfId.displayName} (@${dataIfId.name})`)
                                 .setEmoji(`🆔`)
                           )
                     )
               ],
               allowedMentions: {
                  repliedUser: false
               }
            });

            try {
               // await for an interaction
               const selectMenuInteraction = await message.channel.awaitMessageComponent({
                  componentType: Discord.ComponentType.StringSelect,
                  filter: i => i.customId.startsWith(message.id) && i.user.id === message.author.id,
                  time: 300000 // 5 minutes
               });

               // edit the commandData with the specified id
               const [ id ] = selectMenuInteraction.values;
               dataIfUsername.player = dataIfUsername.player.id === +id
                  ? dataIfUsername.player
                  : {
                     id:          dataIfId.id,
                     displayName: dataIfId.displayName,
                     username:    dataIfId.name
                  };

               // update the interaction's reply
               await selectMenuInteraction.update({
                  content: `### ${emojiLoading} fetching player data..`,
                  components: [],
                  allowedMentions: {
                     repliedUser: false
                  }
               });

            } catch {
               // no interaction received
               return await commandReply.edit({
                  content: `### ${emojiError} command timed out`,
                  components: [],
                  allowedMentions: {
                     repliedUser: false
                  }
               });
            };
         };

         // this is just an id
         if (dataIfId)
            for (const data of commandData)
               if (data.player === `${dataIfId.id}`)
                  data.player = {
                     id:          dataIfId.id,
                     displayName: dataIfId.displayName,
                     username:    dataIfId.name
                  };
      };


   } catch (error) {
      // edit the reply
      return await commandReply.edit({
         content: `### ${emojiError} an error occurred fetching player ids`,
         files: [
            new Discord.AttachmentBuilder()
               .setFile(
                  Buffer.from(error.stack)
               )
               .setName(`error-stack_${message.id}_${Math.floor(message.createdTimestamp / 1000)}.txt`)
         ],
         allowedMentions: {
            repliedUser: false
         }
      });
   };


   // map data that hasn't gotten a player to an error
   for (const data of commandData) {
      if (typeof data.player !== `string`)
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
         return await commandReply.edit({
            content: `### ${emojiError} an error occurred fetching player avatar headshots`,
            files: [
               new Discord.AttachmentBuilder()
                  .setFile(
                     Buffer.from(error.stack)
                  )
                  .setName(`error-stack_${message.id}_${Math.floor(message.createdTimestamp / 1000)}.txt`)
            ],
            allowedMentions: {
               repliedUser: false
            }
         });
      };


   // for each permanent ban (ban without a length), was this meant to be a temporary ban?
   for (const data of commandData) {
      if (data.error)
         continue;

      const isBan = data.action === `Ban`;
      const hasLength = data.length;

      const lengthInReason = data.reason?.split(/ +/)[0];
      const length = parseLength(lengthInReason);

      if (isBan && !hasLength && !!length) {
         await commandReply.edit({
            content: `### ${emojiWarning} is this ban meant to be a __permanent ban__ or __temporary ban for \`${formatDuration(length)}\`__?`,
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(embedColour)
                  .setAuthor({
                     name: `${data.player.displayName} (@${data.player.username})`,
                     url: `https://www.roblox.com/users/${data.player.id}/profile`,
                     iconURL: data.player.avatar || null
                  })
                  .setDescription(`### ${emojiWarning} ban player?`)
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
            ],
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.StringSelectMenuBuilder()
                        .setCustomId(`${message.id}:prompt-edit-ban`)
                        .setPlaceholder(`🦊 select an option..`)
                        .setOptions(
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(`permanent ban`)
                              .setValue(`permanent`)
                              .setEmoji(`🔨`),
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(`temporary ban`)
                              .setValue(`temporary`)
                              .setDescription(`${formatDuration(length)}`)
                              .setEmoji(`⌚`)
                        )
                  )
            ],
            allowedMentions: {
               repliedUser: false
            }
         });

         try {
            // await for an interaction
            const selectMenuInteraction = await message.channel.awaitMessageComponent({
               componentType: Discord.ComponentType.StringSelect,
               filter: i => i.customId.startsWith(message.id) && i.user.id === message.author.id,
               time: 300000 // 5 minutes
            });

            // edit the commandData with the length
            const [ value ] = selectMenuInteraction.values;
            if (value === `temporary`) {
               data.commandName = (() => {
                  switch (data.commandName) {
                     case `ban`:     return `tempban`;
                     case `massban`: return `masstempban`;
                  };
               })();
               data.length = length;
               data.reason = data.reason.slice(data.reason.indexOf(lengthInReason) + lengthInReason.length).trim();
            };

            // update the interaction's reply
            await selectMenuInteraction.update({
               content: `### ${emojiLoading} fetching player data..`,
               embeds: [],
               components: [],
               allowedMentions: {
                  repliedUser: false
               }
            });

         } catch {
            // no interaction received
            return await commandReply.edit({
               content: `### ${emojiError} command timed out`,
               components: [],
               allowedMentions: {
                  repliedUser: false
               }
            });
         };
      }
   };


   // embeds
   const applicationCommands      = await message.guild.commands.fetch();
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
   await commandReply.edit({
      content: null,
      embeds,
      allowedMentions: {
         repliedUser: false
      }
   });


   // push the commandData to the moderations array
   message.client.moderations.push(
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

               guild:      message.guild.id,   // this guild's id
               channel:    message.channel.id, // this channel's id
               message:    commandReply.id,    // this message's id
               embedindex: i,                  // the index of the embed for this action in the message

               moderator: message.author.id // the id of the moderator who sent this moderation
            })
         )
   );
};