import Discord from "discord.js";

/**
 * set a category for where a specific type of support ticket's channels should be sent to
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // options
   const type = interaction.options.getString(`type`);
   const category = interaction.options.getChannel(`category`);


   // formatted type, just like how it appears in the command's choices
   const formattedType = {
      "map-tickets":       `Map Submissions`,
      "exploiter-tickets": `Exploiter/Abuser Reports`,
      "bug-tickets":       `Bug Reports`,
      "ban-tickets":       `Ban Appeals`
   }[type];


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // set these values in the database
   await redis.HSET(`flooded-area:channels:support-tickets`, type, category.id);


   // edit the deferred interaction
   return await interaction.editReply({
      content: `Changed \`${formattedType}\`'s support ticket category to **\`${category.name}\`**.`
   });
};