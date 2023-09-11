export const name = "currency trade";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];


import Discord from "discord.js";

/**
 * @param {Discord.AutocompleteInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // autocomplete info
   const input = interaction.options.getFocused();


   // TODO
   await interaction.respond([]);
};