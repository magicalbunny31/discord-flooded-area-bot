import Discord from "discord.js";

/**
 * if you have the @Events Host role, you can mention members with the @Events role in this channel
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // roles
   const eventHost = await redis.GET(`flooded-area:role:event-host`);
   const events = await redis.HGET(`flooded-area:role:mentions`, `events`);


   // this member doesn't have this role
   if (!interaction.member.roles.cache.has(eventHost))
      return await interaction.reply({
         content: `❌ **you need the ${Discord.roleMention(eventHost)} role to use this command**`,
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // mention the @events role
   await interaction.channel.send({
      content: `${interaction.user}: ${Discord.roleMention(events)}`
   });


   // edit the deferred interaction
   return await interaction.editReply({
      content: `✅ **mentioned ${Discord.roleMention(events)}!**`,
      allowedMentions: {
         parse: []
      }
   });
};