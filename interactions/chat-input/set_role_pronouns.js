import Discord from "discord.js";

/**
 * set a pronoun role for the reaction roles
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // options
   const type = interaction.options.getString(`type`);
   const role = interaction.options.getRole(`role`);


   // formatted type, just like how it appears in the command's choices
   const formattedType = {
      "he-him":           `He/Him`,
      "she-her":          `She/Her`,
      "they-them":        `They/Them`,
      "ask-for-pronouns": `Ask For Pronouns`,
      "any-pronouns":     `Any Pronouns`
   }[type];


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // set this value in the database
   await redis.HSET(`flooded-area:role:pronouns`, type, role.id);


   // edit the deferred interaction
   return await interaction.editReply({
      content: `Set \`${formattedType}\`'s mention role to ${role}.`,
      allowedMentions: {
         parse: []
      }
   });
};