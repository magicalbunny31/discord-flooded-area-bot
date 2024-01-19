export const name = "view-join-dates at-position";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];


import Discord from "discord.js";
import { colours, strip, wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const position = interaction.options.getInteger(`position`);


   // data to show
   const data = {
      [process.env.GUILD_FLOODED_AREA]: {
         colour: colours.flooded_area
      },

      [process.env.GUILD_SPACED_OUT]: {
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
   await interaction.deferReply();


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


   // get this join position's member in the arrays
   const currentMember = currentMembers
      .filter((v, i, s) =>
         i === s.findIndex(member => member.id === v.id)
      )
      .at(position - 1);

   const historicalMember = historicalMembers
      .filter((v, i, s) =>
         i === s.findIndex(member => member.id === v.id)
      )
      .at(position - 1);


   // this currentMember as a user
   const currentUser = currentMember
      ? currentMember.user || await interaction.client.users.fetch(currentMember.id)
      : undefined;

   const currentUserColour = currentUser
      ? currentUser.accentColor || (await interaction.client.users.fetch(currentMember.id, { force: true })).accentColor
      : undefined;


   // this historicalMember as a user
   const historicalUser = historicalMember
      ? historicalMember.user || await interaction.client.users.fetch(historicalMember.id)
      : undefined;

   const historicalUserColour = historicalUser
      ? historicalUser.accentColor || (await interaction.client.users.fetch(historicalMember.id, { force: true })).accentColor
      : undefined;


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(
            position <= currentMembers.length
               ? currentUserColour || data.colour
               : colours.red
         )
         .setAuthor(
            position <= currentMembers.length
               ? {
                  name:    `@${currentUser.username}`,
                  iconURL: currentUser.displayAvatarURL()
               }
               : null
         )
         .setDescription(
            position <= currentMembers.length
               ? strip`
                  ### 👤 They're currently the ${position.toLocaleString()}${getOrdinalSuffix(position)} member
                  > - Joined at ${Discord.time(currentMember.joinedAt)}
               `
               : `### ❌ Nobody is currently the ${position.toLocaleString()}${getOrdinalSuffix(position)} member`
         )
         .setFooter({
            text: `${currentMembers.length.toLocaleString()} members`,
            iconURL: interaction.guild.iconURL()
         }),

      new Discord.EmbedBuilder()
         .setColor(
            position <= historicalMembers.length
               ? historicalUserColour || data.colour
               : colours.red
         )
         .setAuthor(
            position <= historicalMembers.length
               ? {
                  name:    `@${historicalUser.username}`,
                  iconURL: historicalUser.displayAvatarURL()
               }
               : null
         )
         .setDescription(
            position <= historicalMembers.length
               ? strip`
                  ### 👤 They're historically the ${position.toLocaleString()}${getOrdinalSuffix(position)} member
                  > - First joined at ${Discord.time(historicalMember.joinedTimestamp)}
               `
               : `### ❌ Nobody was historically the ${position.toLocaleString()}${getOrdinalSuffix(position)} member`
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