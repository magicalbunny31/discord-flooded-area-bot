export const name = "View Join Dates";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES ];

export const data = new Discord.ContextMenuCommandBuilder()
   .setType(Discord.ApplicationCommandType.User)
   .setName(`View Join Dates`);


import Discord from "discord.js";
import { colours, strip, wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.UserContextMenuCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const user   = interaction.targetUser;
   const member = interaction.targetMember;


   // data to show
   const data = {
      [process.env.GUILD_FLOODED_AREA]: {
         colour: colours.flooded_area
      },

      [process.env.GUILD_UNIVERSE_LABORATORIES]: {
         colour: colours.spaced_out
      }
   }[interaction.guild.id];


   // function to get the ordinal suffix of a number
   // https://stackoverflow.com/a/13627586
   const getOrdinalSuffix = number => {
      const oneth = number % 10;
      const tenth = number % 100;

      switch (true) {
         case oneth === 1 && tenth !== 11:
            return `st`;
         case oneth === 2 && tenth !== 12:
            return `nd`;
         case oneth === 3 && tenth !== 13:
            return `rd`;
         default:
            return `th`;
      };
   };


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // fetch members in this guild and sort them by their join date
   const currentMembers = (
      await (async () => {
         const fetchedMembers = [];
         let lastMember;

         while (true) {
            const members = (await interaction.guild.members.list({ limit: 1000, ...fetchedMembers.length ? { after: fetchedMembers.at(-1).id } : {} }));

            fetchedMembers.push(...members.values());

            if (lastMember?.id === fetchedMembers.at(-1).id)
               break;

            else
               lastMember = fetchedMembers.at(-1);

            await wait(1000);
         };

         return fetchedMembers;
      })()
   )
      .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);


   // fetch all historical members for this guild and sort them by their join date
   const historicalMembers = (
      await (async () => {
         const members = (await firestore.collection(`who-joined-at`).doc(interaction.guild.id).get()).data() || {};
         return Object.entries(members)
            .map(([ id, timestamp ]) => ({ id, joinedTimestamp: timestamp.seconds }));
      })()
   )
      .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);


   // get this member's join position in the array
   const currentPosition = currentMembers
      .filter((v, i, s) =>
         i === s.findIndex(member => member.id === v.id)
      )
      .findIndex(member => member.id === user.id) + 1;

   const historicalPosition = historicalMembers
      .filter((v, i, s) =>
         i === s.findIndex(member => member.id === v.id)
      )
      .findIndex(member => member.id === user.id) + 1;


   // embeds
   const userColour = user.accentColor || (await interaction.client.users.fetch(user.id, { force: true })).accentColor;

   const historicalMemberJoinedTimestamp = historicalMembers[historicalPosition - 1]?.joinedTimestamp;

   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(
            currentPosition
               ? userColour || data.colour
               : colours.red
         )
         .setAuthor(
            currentPosition
               ? {
                  name:    `@${user.username}`,
                  iconURL: user.displayAvatarURL()
               }
               : null
         )
         .setDescription(
            currentPosition
               ? strip`
                  ### 👤 They're currently the ${currentPosition.toLocaleString()}${getOrdinalSuffix(currentPosition)} member
                  > - Joined at ${Discord.time(member.joinedAt)}
               `
               : `### ❌ ${user} isn't in this server`
         )
         .setFooter({
            text: `${currentMembers.length.toLocaleString()} members`,
            iconURL: interaction.guild.iconURL()
         }),



      new Discord.EmbedBuilder()
         .setColor(
            historicalPosition
               ? userColour || data.colour
               : colours.red
         )
         .setAuthor(
            historicalPosition
               ? {
                  name:    `@${user.username}`,
                  iconURL: user.displayAvatarURL()
               }
               : null
         )
         .setDescription(
            historicalPosition
               ? strip`
                  ### 👤 They're historically the ${historicalPosition.toLocaleString()}${getOrdinalSuffix(historicalPosition)} member
                  > - First joined at ${Discord.time(historicalMemberJoinedTimestamp)}
               `
               : `### ❌ ${user} has never joined this server`
         )
         .setFooter({
            text: `${historicalMembers.length.toLocaleString()} total members`,
            iconURL: interaction.guild.iconURL()
         })
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds
   });
};