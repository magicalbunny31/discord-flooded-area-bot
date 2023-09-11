export const name = "who-joined-at by-member";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];


import Discord from "discord.js";
import { colours, strip, wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const user           = interaction.options.getUser(`member`);
   const checkFirstJoin = interaction.options.getBoolean(`check-first-join`);


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


   // member isn't in this guild
   const member = interaction.options.getMember(`member`);

   if (!checkFirstJoin && !member)
      return await interaction.reply({
         content: `### ❌ ${user} isn't in this server.`,
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply();


   // fetch all members and sort them by their join date
   const members = (
      checkFirstJoin
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


   // member hasn't joined this guild
   if (checkFirstJoin && !members.find(member => member.id === user.id))
      return await interaction.editReply({
         content: `### ❌ ${user} has never joined this server.`,
         allowedMentions: {
            parse: []
         }
      });


   // get this member's join position in the array
   const position = members
      .filter((v, i, s) =>
         i === s.findIndex(member => member.id === v.id)
      )
      .findIndex(member => member.id === user.id) + 1;


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colour)
         .setAuthor({
            name:    `@${user.username}`,
            iconURL: user.displayAvatarURL()
         })
         .setDescription(
            checkFirstJoin
               ? strip`
                  ### 👤 If nobody left once joined, they'd be the ${position.toLocaleString()}${getOrdinalSuffix(position)} member
                  > - First joined at ${Discord.time(members[position - 1].joinedTimestamp)}
               `
               : strip`
                  ### 👤 They're the ${position.toLocaleString()}${getOrdinalSuffix(position)} member
                  > - Joined at ${Discord.time(member.joinedAt)}
               `
         )
         .setFooter({
            text: checkFirstJoin
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