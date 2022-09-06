import Discord from "discord.js";

/**
 * set the @Event Host role
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // options
   const role = interaction.options.getRole(`role`);


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // set this value in the database
   await redis.SET(`flooded-area:role:event-host`, role.id);


   // edit the deferred interaction
   return await interaction.editReply({
      content: `set the @Event Host role to ${role}`,
      allowedMentions: {
         parse: []
      }
   });
};