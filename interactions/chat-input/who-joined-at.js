import Discord from "discord.js";
import { emojis, strip, wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * who joined at what??
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // options
   const position = interaction.options.getInteger(`position`);


   // function to fetch all members using snowflake ids pagination
   // https://discord.com/developers/docs/reference#snowflake-ids-in-pagination
   const fetchAllMembers = async guild => {
      const fetchedMembers = [];
      let lastMember;

      while (true) {
         const members = (await guild.members.list({ limit: 1000, ...fetchedMembers.length ? { before: fetchedMembers.at(-1).id } : {} }));

         fetchedMembers.push(...members.values());

         if (lastMember?.id === fetchedMembers.at(-1).id)
            break;

         else
         lastMember = fetchedMembers.at(-1);

         await wait(1000);
      };

      return fetchedMembers;
   };


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


   // "defer" the interaction
   await interaction.reply({
      content: `${emojis.foxbox}${emojis.foxsleep}${emojis.foxsnug}`
   });


   // fetch all members and sort them by their join date
   const members = (await fetchAllMembers(interaction.guild))
      .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);


   // get the member at the specified position
   const member = members
      .filter((v, i, s) =>
         i === s.findIndex(member => member.id === v.id)
      )
      .at(position - 1);


   // edit the deferred interaction
   return await interaction.editReply({
      content: member
         ? strip`
            ${member} is the **\`${position}${getOrdinalSuffix(position)} member\`** of \`${interaction.guild.memberCount} members\`
            > they joined at ${Discord.time(Math.floor(member.joinedTimestamp / 1000))}
         `
         : strip`
            nobody is the **\`${position}${getOrdinalSuffix(position)} member\`**
            > there are currently \`${interaction.guild.memberCount} members\` in this server
         `,
      allowedMentions: {
         parse: []
      }
   });
};