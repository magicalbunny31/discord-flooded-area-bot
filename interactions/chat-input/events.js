export const data = new Discord.SlashCommandBuilder()
   .setName(`events`)
   .setDescription(`📣 if you have the @Events Host role, you can mention members with the @Events role in this channel`);

export const guildOnly = true;


import Discord from "discord.js";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // this member doesn't have this role
   if (!interaction.member.roles.cache.has(process.env.ROLE_EVENT_HOST))
      return await interaction.editReply({
         content: `❌ **you need the ${Discord.roleMention(process.env.ROLE_EVENT_HOST)} role to use this command**`,
         ephemeral: true
      });


   // mention the @events role
   await interaction.channel.send({
      content: `${interaction.user}: ${Discord.roleMention(process.env.ROLE_EVENTS)}`
   });


   // edit the deferred interaction
   return await interaction.editReply({
      content: `✅ **mentioned ${Discord.roleMention(process.env.ROLE_EVENTS)}!**`
   });
};