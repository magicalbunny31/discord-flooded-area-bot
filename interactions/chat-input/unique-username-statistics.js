export const name = "unique-username-statistics";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`unique-username-statistics`)
   .setDescription(`View who has the new Unique Usernames in this server`);


import Discord from "discord.js";
import { colours, choice, partition, wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // colour to show
   const colour = {
      [process.env.GUILD_FLOODED_AREA]: colours.flooded_area,
      [process.env.GUILD_SPACED_OUT]:   colours.spaced_out
   }[interaction.guild.id];


   // defer the interaction
   await interaction.deferReply();


   // fetch all members
   const members = await (async () => {
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
   })();


   // get members who have the unique usernames vs people who don't
   const [ uniqueUsernameMembers, oldUsernameMembers ] = partition(members, member => member.user.discriminator === `0`);


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colour)
         .setFields({
            name: `Members with Unique Usernames (\`@${choice(uniqueUsernameMembers).user.username}\`)`,
            value: `> ${uniqueUsernameMembers.length.toLocaleString()} members`,
            inline: true
         }, {
            name: `Members with old usernames (\`@${choice(oldUsernameMembers).user.tag}\`)`,
            value: `> ${oldUsernameMembers.length.toLocaleString()} members`,
            inline: true
         })
   ];


   // edit the deferred interaction
   await interaction.editReply({
      embeds
   });
};