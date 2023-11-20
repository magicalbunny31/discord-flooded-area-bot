export const name = "view-join-dates";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`view-join-dates`)
   .setDescription(`View join dates and positions for a member or an index`)
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`at-position`)
         .setDescription(`View the member who joined this server at this position`)
         .addIntegerOption(
            new Discord.SlashCommandIntegerOption()
               .setName(`position`)
               .setDescription(`Position's member to search for`)
               .setMinValue(1)
               .setRequired(true)
         )
   )
   .addSubcommand(
      new Discord.SlashCommandSubcommandBuilder()
         .setName(`for-member`)
         .setDescription(`View a member's join position in this server`)
         .addUserOption(
            new Discord.SlashCommandUserOption()
               .setName(`member`)
               .setDescription(`Member's position to search for`)
               .setRequired(true)
         )
   );


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