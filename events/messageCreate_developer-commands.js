export const name = Discord.Events.MessageCreate;


import Discord from "discord.js";
import { developerCommands } from "@magicalbunny31/fennec-utilities";

/**
 * @param {Discord.Message} message
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (message, firestore) =>
   await developerCommands(
      message,
      message.client.fennec,
      JSON.parse(process.env.DEVELOPERS.replaceAll(`'`, `"`))
   );