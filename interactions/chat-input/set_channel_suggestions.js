import Discord from "discord.js";

/**
 * set a channel for suggestion submissions to be sent to
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // options
   const type = interaction.options.getString(`type`);
   const channel = interaction.options.getChannel(`channel`);


   // formatted type, just like how it appears in the command's choices
   const formattedType = {
      "game-suggestions":       `Game Suggestions`,
      "server-suggestions":     `Server Suggestions`,
      "part-suggestions":       `Part Suggestions`,
      "news-board-suggestions": `News Board Suggestions`
   }[type];


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // set this value in the database
   await redis.HSET(`flooded-area:channel:suggestions`, type, channel.id);


   // edit the deferred interaction
   return await interaction.editReply({
      content: `Set \`${formattedType}\`'s suggestion channel to ${channel}.`
   });
};