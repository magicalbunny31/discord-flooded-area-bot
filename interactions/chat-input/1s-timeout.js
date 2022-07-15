import Discord from "discord.js";

/**
 * time out someone for 1 second lmao
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // options
   const user = interaction.options.getUser(`member`);
   const member = interaction.options.getMember(`member`);


   // this member isn't in this server
   if (!member)
      return await interaction.reply({
         content: `what are you doing ${user} isn't even in this server`,
         ephemeral: true
      });


   // can't moderate this member
   if (!member.moderatable)
      return await interaction.reply({
         content: `${interaction.client.user} can't timeout ${member} sorry`,
         allowedMentions: {
            parse: []
         },
         ephemeral: true
      });


   // defer the reply
   await interaction.deferReply({
      ephemeral: true
   });


   // timeout the member for 1 second
   await member.timeout(1000, `[ ${interaction.user.tag} (${interaction.user.id}) ] »»» /1s-timeout`);


   // edit the deferred reply
   return await interaction.editReply({
      content: `<:trollface:986018189324468304>`
   });
};