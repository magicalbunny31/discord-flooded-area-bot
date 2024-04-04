export const name = "music-player stop";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_BUNNY_FURFEST ];


import Discord from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";
import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

import cache from "../../data/cache.js";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // the bot isn't playing anything
   const currentMusicPlayerInfo = cache.get(`music-player:${interaction.guild.id}`);
   const voiceConnection        = getVoiceConnection(interaction.guild.id);

   if (!currentMusicPlayerInfo || !voiceConnection)
      return await interaction.reply({
         content: strip`
            ### ❌ The music player is off
            > - You can only use ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`music-player`, `stop`, interaction.commandId)} when ${interaction.client.user} is streaming music to a voice channel.
         `,
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply();


   // remove the music player info from the cache
   cache.del(`music-player:${interaction.guild.id}`);


   // destroy the voice connection
   voiceConnection.destroy();


   // edit the deferred interaction
   await interaction.editReply({
      content: strip`
         ### ✅ Stopped music player!
         > - ${interaction.client.user} has left ${Discord.channelMention(voiceConnection.joinConfig.channelId)}.
      `
   });
};