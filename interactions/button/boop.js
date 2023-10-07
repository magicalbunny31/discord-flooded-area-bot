export const name = "boop";
export const guilds = [ process.env.GUILD_BUN_TESTERS ];

import Discord from "discord.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button ] = interaction.customId.split(`:`);


   // defer the interaction's update
   await interaction.deferUpdate();
};