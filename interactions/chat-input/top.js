export const data = new Discord.SlashCommandBuilder()
   .setName(`top`)
   .setDescription(`🔝 Go to this thread's starter message.`);

export const guildOnly = true;


import Discord from "discord.js";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // this command isn't from a thread
   if (!interaction.channel.isThread())
      return await interaction.reply({
         content: `❌ **This command must be used in a thread.**`,
         allowedMentions: {
            parse: []
         },
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // fetch this thread's starter message
   const starterMessage = await interaction.channel.fetchStarterMessage();


   // edit the deferred interaction
   return await interaction.editReply({
      components: [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setLabel(`Jump to message!`)
                  .setEmoji(`💬`)
                  .setStyle(Discord.ButtonStyle.Link)
                  .setURL(starterMessage.url)
            )
      ]
   });
};