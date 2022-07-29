import Discord from "discord.js";

/**
 * set a mention role for the reaction roles
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // options
   const type = interaction.options.getString(`type`);
   const role = interaction.options.getRole(`role`);


   // formatted type, just like how it appears in the command's choices
   const formattedType = {
      "looking-for-group":         `Looking For Group`,
      "events":                    `Events`,
      "polls":                     `Polls`,
      "updates-sneak-peaks":       `Updates/Sneak Peaks`,
      "giveaways":                 `Giveaways`,
      "challenges":                `Challenges`,
      "doruk's-exceptional-pings": `Doruk's Exceptional Pings`
   }[type];


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // set this value in the database
   await redis.HSET(`flooded-area:role:mentions`, type, role.id);


   // edit the deferred interaction
   return await interaction.editReply({
      content: `Set \`${formattedType}\`'s mention role to ${role}.`,
      allowedMentions: {
         parse: []
      }
   });
};