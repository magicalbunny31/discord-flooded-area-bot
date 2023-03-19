export const data = new Discord.SlashCommandBuilder()
   .setName(`tempban`)
   .setDescription(`Temporarily ban a player from Flooded Area 🌊`)
   .addIntegerOption(
      new Discord.SlashCommandIntegerOption()
         .setName(`player`)
         .setDescription(`Player to ban`)
         .setAutocomplete(true)
         .setRequired(true)
   )
   .addIntegerOption(
      new Discord.SlashCommandIntegerOption()
         .setName(`time`)
         .setDescription(`Time in seconds of how long to ban this player for`)
         .setMinValue(1)
         .setMaxValue(2628000)
         .setAutocomplete(true)
         .setRequired(true)
   )
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`reason`)
         .setDescription(`Reason for this player's ban`)
         .setMaxLength(1024)
         .setRequired(false)
   )
   .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageGuild)
   .setDMPermission(false);


import Discord from "discord.js";
import fetch from "node-fetch";
import dayjs from "dayjs";

import { readFile } from "fs/promises";
const pkg = JSON.parse(await readFile(`./package.json`));

import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 */
export default async interaction => {
   // options
   const playerId           = interaction.options.getInteger(`player`);
   const timeToBanInSeconds = interaction.options.getInteger(`time`);
   const reason             = interaction.options.getString (`reason`) || ``;


   // defer the interaction
   await interaction.deferReply();


   // user-agent for requests
   const userAgent = `${pkg.name}/${pkg.version} (${process.env.GITHUB})`;


   // get a user by user id
   // https://users.roblox.com/docs
   const userByUserId = await (async () => {
      // send a http get request
      const response = await fetch(`https://users.roblox.com/v1/users/${playerId}`, {
         headers: {
            "Accept": `application/json`,
            "User-Agent": userAgent
         }
      });

      // response is good, return its data
      if (response.ok)
         return await response.json();

      // something went wrong, return nothing
      else
         return null;
   })();


   // inputted player doesn't exist
   if (!userByUserId)
      return await interaction.editReply({
         content: strip`
            ❌ **A player doesn't exist with \`${playerId}\` as an id.**
            > If this player *does* exist, ${Discord.hyperlink(`Roblox might currently be having an outage`, `https://status.roblox.com`)}.
         `
      });


   // get a user's avatar bust by user id
   // https://thumbnails.roblox.com/docs/index.html#!/
   const avatarBustByUserId = await (async () => {
      // send a http get request
      const response = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-bust?userIds=${playerId}&size=420x420&format=Png&isCircular=false`, {
         headers: {
            "Accept": `application/json`,
            "User-Agent": userAgent
         }
      });

      // response is good, return its data
      if (response.ok)
         return (await response.json()).data[0].imageUrl;

      // something went wrong, return nothing
      else
         return null;
   })();


   // formatted humanised time
   const formattedDuration = (() => {
      const format = [];
      const duration = dayjs.duration(timeToBanInSeconds, `seconds`);

      const days = (duration.years() * 365) + (duration.months() * 30) + duration.days();

      if (duration.asDays()    >= 1) format.push(`${days} ${days === 1 ? `day` : `days`}`);
      if (duration.asHours()   >= 1) format.push(`${duration.hours()} ${duration.hours() === 1 ? `hour` : `hours`}`);
      if (duration.asMinutes() >= 1) format.push(`${duration.minutes()} ${duration.minutes() === 1 ? `minute` : `minutes`}`);
      if (duration.asSeconds() >= 1) format.push(`${duration.seconds()} ${duration.seconds() === 1 ? `second` : `seconds`}`);

      return format.join(`, `);
   })();


   // edit the deferred interaction
   await interaction.editReply({
      content: `📥 **Sending temporary ban...**`,
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setAuthor({
               name: userByUserId
                  ? `${userByUserId.displayName} (@${userByUserId.name})`
                  : `A Player with the id \`${playerId}\``,
               url: `https://www.roblox.com/users/${playerId}/profile`,
               iconURL: avatarBustByUserId
            })
            .setDescription(strip`
               **\`reason\`** : ${reason ? `\`${reason}\`` : ``}
               **\`length\`** : \`${formattedDuration}\`
            `)
      ]
   });


   // push this ban to the moderations array
   interaction.client.moderations.push({
      method: `Ban`,              // what action the server will take on this player (ban them)
      reason,                     // the reason to display to the player on kick, if they are currently in a server (also displays on the moderation logs embed)
      length: timeToBanInSeconds, // length in seconds to ban this player for

      value:       playerId,                  // player (id)           to ban
      displayName: userByUserId?.displayName, // player (display name) to ban
      username:    userByUserId?.name,        // player (username)     to ban
      avatarBust:  avatarBustByUserId,        // image url to player's avatar bust

      guild:   interaction.guild.id,                // this guild's id
      channel: interaction.channel.id,              // this channel's id
      message: (await interaction.fetchReply()).id, // this message's id

      moderator: interaction.user.id // the id of the moderator who sent this ban
   });


   /* this interaction will be edited once the lua server sends a request to this server~ */
};