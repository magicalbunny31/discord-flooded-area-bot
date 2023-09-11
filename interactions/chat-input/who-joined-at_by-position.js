export const name = "who-joined-at by-position";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];


import Discord from "discord.js";
import { colours, strip, wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const position       = interaction.options.getInteger(`position`);
   const checkFirstDate = interaction.options.getBoolean(`check-first-date`);


   // colour to show
   const colour = {
      [process.env.GUILD_FLOODED_AREA]: colours.flooded_area,
      [process.env.GUILD_SPACED_OUT]:   colours.spaced_out
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


   // position exceeds member count
   if (!checkFirstDate && position > interaction.guild.memberCount)
      return await interaction.reply({
         content: `### ❌ Nobody is the ${position.toLocaleString()}${getOrdinalSuffix(position)} member: there are ${interaction.guild.memberCount.toLocaleString()} members in this server.`,
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply();


   // fetch all members and sort them by their join date
   const members = (
      checkFirstDate
         ? await (async () => {
            const members = (await firestore.collection(`who-joined-at`).doc(interaction.guild.id).get()).data() || {};
            return Object.entries(members)
               .map(([ id, timestamp ]) => ({ id, joinedTimestamp: timestamp.seconds }));
         })()
         : await (async () => {
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


   // position exceeds member count
   if (checkFirstDate && position > members.length)
      return await interaction.editReply({
         content: `### ❌ Nobody is historically the ${position.toLocaleString()}${getOrdinalSuffix(position)} member: there have been ${members.length.toLocaleString()} total members in this server.`
      });


   // get this this join position's member in the array
   const member = members
      .filter((v, i, s) =>
         i === s.findIndex(member => member.id === v.id)
      )
      .at(position - 1);


   // embeds
   const user = member.user || await interaction.client.users.fetch(member.id);

   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colour)
         .setAuthor({
            name:    `@${user.username}`,
            iconURL: user.displayAvatarURL()
         })
         .setDescription(
            checkFirstDate
               ? strip`
                  ### 👤 If nobody left once joined, they'd be the ${position.toLocaleString()}${getOrdinalSuffix(position)} member
                  > - First joined at ${Discord.time(member.joinedTimestamp)}
               `
               : strip`
                  ### 👤 They're the ${position.toLocaleString()}${getOrdinalSuffix(position)} member
                  > - Joined at ${Discord.time(member.joinedAt)}
               `
         )
         .setFooter({
            text: checkFirstDate
               ? `${members.length.toLocaleString()} total members`
               : `${interaction.guild.memberCount.toLocaleString()} members`,
            iconURL: interaction.guild.iconURL()
         })
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds
   });
};