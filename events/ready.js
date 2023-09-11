export const name = Discord.Events.ClientReady;
export const once = true;


import Discord from "discord.js";
import fs from "fs/promises";

import { choice, partition } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Client} client
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (client, firestore) => {
   // it's so empty in here~
};