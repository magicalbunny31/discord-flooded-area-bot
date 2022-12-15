export const data = new Discord.SlashCommandBuilder()
   .setName(`who-joined-at`)
   .setDescription(`👥 who joined at what??`)
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`by-member`)
         .setDescription(`👤 search for a member's join position in the server`)
         .addUserOption(
            new Discord.SlashCommandUserOption()
               .setName(`member`)
               .setDescription(`🔎 the member's position to search for`)
               .setRequired(true)
         )
   )
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`by-position`)
         .setDescription(`🔢 search for the member who joined at a position in the server`)
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`position`)
               .setDescription(`🔎 the position's member to search for`)
               .setMinValue(1)
               .setRequired(true)
         )
   )
   .setDMPermission(false);


import Discord from "discord.js";
import { colours, emojis, strip, wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const user   = interaction.options.getUser  (`member`);
   const member = interaction.options.getMember(`member`);

   const position = interaction.options.getInteger(`position`);


   // function to fetch all members using snowflake ids pagination
   // https://discord.com/developers/docs/reference#snowflake-ids-in-pagination
   const fetchAllMembers = async guild => {
      const fetchedMembers = [];
      let lastMember;

      while (true) {
         const members = (await guild.members.list({ limit: 1000, ...fetchedMembers.length ? { after: fetchedMembers.at(-1).id } : {} }));

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


   // member isn't in this guild
   if (user && !member)
      return await interaction.reply({
         content: strip`
            ❌ **${user} isn't in this server**
            > therefore they don't have a join position ${emojis.happ}
         `,
         ephemeral: true
      });


   // position exceeds member count
   if (position && position > interaction.guild.memberCount)
      return await interaction.reply({
         content: strip`
            ❌ **nobody is the \`${position.toLocaleString()}${getOrdinalSuffix(position)} member\`**
            > there are currently \`${interaction.guild.memberCount.toLocaleString()} members\` in this server
         `,
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply();


   // fetch all members and sort them by their join date
   const members = (await fetchAllMembers(interaction.guild))
      .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);


   // get this member's join position in the array
   const positionOrMember = user
      ? members
         .filter((v, i, s) =>
            i === s.findIndex(member => member.id === v.id)
         )
         .findIndex(member => member.id === user.id) + 1
      : members
         .filter((v, i, s) =>
            i === s.findIndex(member => member.id === v.id)
         )
         .at(position - 1);


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setAuthor({
            name:    (member ? member : positionOrMember)?.user.tag                || null,
            iconURL: (member ? member : positionOrMember)?.user.displayAvatarURL() || null
         })
         .setDescription(
            member || positionOrMember
            ? strip`
               👤 **\`${(position ? position : positionOrMember).toLocaleString()}${getOrdinalSuffix(position ? position : positionOrMember)} member\` of \`${interaction.guild.memberCount.toLocaleString()} members\`**
               > they joined at ${Discord.time(Math.floor((member ? member : positionOrMember).joinedTimestamp / 1000))}
            `
            : strip`
               ❌ **an error occurred getting the \`${position.toLocaleString()}${getOrdinalSuffix(position)} member\`**
               > try a different position, or see if this'll work later ${emojis.happ}
            `
         )
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds
   });
};