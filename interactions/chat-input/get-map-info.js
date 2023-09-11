export const name = "get-map-info";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`get-map-info`)
   .setDescription(`Get a map's id, for queuing maps with mod/admin panel`);


import Discord from "discord.js";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // reply to the interaction
   await interaction.reply({
      content: `See ${Discord.channelMention(process.env.FA_CHANNEL_MAP_IDS)} for a list of the maps.`,
      ephemeral: true
   });
};