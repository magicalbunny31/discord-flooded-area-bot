import Discord from "discord.js";

/**
 * set a channel for where a specific type of suggestion's submissions should be sent to
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // options
   const type = interaction.options.getString(`type`);
   const channel = interaction.options.getChannel(`channel`);


   // formatted type, just like how it appears in the command's choices
   const formattedType = {
      "game-suggestions":   `Game Suggestions`,
      "server-suggestions": `Server Suggestions`,
      "part-suggestions":   `Part Suggestions`
   }[type];


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // set these values in the database
   await redis.HSET(`flooded-area:channels:suggestions`, type, channel.id);


   // edit the deferred interaction
   return await interaction.editReply({
      content: `Changed \`${formattedType}\`'s suggestion channel to ${channel}.`
   });
};