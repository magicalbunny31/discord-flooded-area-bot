export const name = Discord.Events.VoiceStateUpdate;


import Discord from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

import cache from "../data/cache.js";

/**
 * @param {Discord.VoiceState} oldState
 * @param {Discord.VoiceState} newState
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (oldState, newState, firestore) => {
   // the bot isn't in the voice channel of this VoiceState
   if (!(newState.channel?.members.get(newState.client.user.id) || oldState.channel?.members.get(newState.client.user.id)))
      return;


   // this guild
   const guildId = newState.guild.id || oldState.guild.id;


   if (newState.channel?.members.size === 1 || oldState.channel?.members.size === 1) { // the bot is alone in the voice channel
      // create a timeout leave this voice channel and remove the cache entry in one minute
      const oneMinute = 60000;
      const timeout = setTimeout(() => {
         const connection = getVoiceConnection(guildId);
         if (connection) {
            connection.destroy();
            cache.del(`music-player:${guildId}`);
         };
      }, oneMinute);

      // set this timeout
      newState.client.voiceChannelDisconnector.set(guildId, timeout);


   } else { // the isn't alone in the voice channel
      // create a timeout leave this voice channel (if it exists)
      const timeout = newState.client.voiceChannelDisconnector.get(guildId);
      if (timeout)
         clearTimeout(timeout);

      // delete this timeout
      newState.client.voiceChannelDisconnector.delete(guildId);
   };
};