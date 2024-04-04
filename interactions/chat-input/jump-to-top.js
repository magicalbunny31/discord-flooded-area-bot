export const name = "jump-to-top";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`jump-to-top`)
   .setDescription(`Go to the first message of this channel`);


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


   // fetch this channel's first message
   const firstMessage = await (async () => {
      const messages = await interaction.channel.messages.fetch({ limit: 1, after: interaction.channel.id });
      return messages?.first();
   })();


   // this channel probably has no message
   if (!firstMessage)
      return await interaction.editReply({
         content: `### ❌ Failed to fetch message`
      });


   // edit the deferred interaction
   await interaction.editReply({
      components: [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setLabel(`Go to message`)
                  .setStyle(Discord.ButtonStyle.Link)
                  .setURL(firstMessage.url)
            )
      ]
   });
};