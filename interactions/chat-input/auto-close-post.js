export const data = new Discord.SlashCommandBuilder()
   .setName(`auto-close-post`)
   .setDescription(`🔕 close a post`)
   .addIntegerOption(
      new Discord.SlashCommandIntegerOption()
         .setName(`in`)
         .setDescription(`⏳ when to close this post`)
         .setChoices({
            name: `📅 1 hour`,
            value: 3600
         }, {
            name: `📅 6 hours`,
            value: 21600
         }, {
            name: `📅 12 hours`,
            value: 43200
         }, {
            name: `📅 1 day`,
            value: 86400
         })
         .setRequired(true)
   )
   .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageMessages);

export const guildOnly = true;


import Discord from "discord.js";
import { Timestamp } from "@google-cloud/firestore";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {

};