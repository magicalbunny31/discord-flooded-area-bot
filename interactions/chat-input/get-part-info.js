export const name = "get-part-info";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`get-part-info`)
   .setDescription(`Get a part's id, for spawning with mod/admin panel`);


import Discord from "discord.js";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // reply to the interaction
   await interaction.reply({
      content: `See ${Discord.channelMention(process.env.FA_CHANNEL_PART_IDS)} for a list of the parts.`,
      ephemeral: true
   });
};