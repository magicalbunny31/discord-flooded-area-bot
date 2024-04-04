export const name = "music-player play random";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_BUNNY_FURFEST ];


import Discord from "discord.js";
import { createReadStream } from "fs";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, demuxProbe, entersState, getVoiceConnection, joinVoiceChannel, VoiceConnectionDisconnectReason, VoiceConnectionStatus } from "@discordjs/voice";
import { colours, emojis, choice, strip, wait } from "@magicalbunny31/awesome-utility-stuff";

import cache from "../../data/cache.js";
import musicPlayer from "../../data/music-player.js";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const behaviour = interaction.options.getString(`behaviour`);


   // data to show
   const data = {
      [process.env.GUILD_FLOODED_AREA]: {
         colour: colours.flooded_area,
         name:   `flooded-area`
      },

      [process.env.GUILD_BUNNY_FURFEST]: {
         colour: colours.flooded_area,
         name:   `flooded-area`
      }
   }[interaction.guild.id];


   // function to get a track
   const getTrack = previousRobloxAssetId => choice(
      musicPlayer[data.name]
         .filter(data => data.robloxAssetId !== previousRobloxAssetId)
   );


   // function to create embeds
   const createEmbeds = (track, channelId, behaviour) => [
      new Discord.EmbedBuilder()
         .setColor(data.colour)
         .setTitle(`🎶 ${track.name}`)
         .setURL(`https://create.roblox.com/marketplace/asset/${track.robloxAssetId}`)
         .setThumbnail(`attachment://${track.albumArtFile}`)
         .setFields([
            {
               name: `📂 Category`,
               value: `> ${track.categoryName}`,
               inline: true
            },
            ...track.composers.length
               ? [{
                  name: `🎼 Composers`,
                  value: track.composers
                     .map(composer => `> ${composer}`)
                     .join(`\n`),
                  inline: true
               }]
               : []
         ])
         .setFooter({
            text: track.provider
         }),

      new Discord.EmbedBuilder()
         .setColor(data.colour)
         .setAuthor({
            name: `Music Player`,
            iconURL: `attachment://Music_Player.webp`
         })
         .setFields({
            name: `🔉 Streaming to voice channel`,
            value: `> ${Discord.channelMention(channelId)}`,
            inline: true
         }, {
            name: `💭 When the track finishes playing...`,
            value: `> ${
               {
                  "loop-category": `Play another track from this category.`,
                  "loop-random":   `Play another random track.`,
                  "loop-track":    `Repeat the last played track.`,
                  "disconnect":    `Stop the music player and leave the voice channel.`
               }[behaviour]
            }`,
            inline: true
         })
   ];


   // function to create files
   const createFiles = track => [
      ...track.albumArtFile
         ? [
            new Discord.AttachmentBuilder()
               .setFile(`./assets/music-player/${track.albumArtFile}`)
         ]
         : [],

      new Discord.AttachmentBuilder()
         .setFile(`./assets/music-player/Music_Player.webp`)
   ];


   // get a track
   const track = getTrack();


   // member isn't in a voice channel
   if (!interaction.member.voice.channel)
      return await interaction.reply({
         content: strip`
            ### ❌ Can't start music player
            > - You need to join a voice channel for ${interaction.client.user} to stream music to.
         `,
         ephemeral: true
      });


   // the bot is in a voice channel and playing a track already
   const currentMusicPlayerInfo = cache.get(`music-player:${interaction.guild.id}`);
   const voiceConnection        = getVoiceConnection(interaction.guild.id);

   if (currentMusicPlayerInfo && voiceConnection) {
      await interaction.deferReply({
         ephemeral: true
      });

      const track = musicPlayer[data.name].find(data => data.robloxAssetId === currentMusicPlayerInfo.robloxAssetId);

      return await interaction.editReply({
         content: strip`
            ### ❌ The music player is already on!
            > - ${interaction.client.user} is already connected to ${Discord.channelMention(voiceConnection.joinConfig.channelId)}.
            >  - Stop the music player with ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`music-player`, `stop`, interaction.commandId)} to make ${interaction.client.user} leave ${interaction.guild.members.me.voice.channel}.
         `,
         embeds: createEmbeds(track, voiceConnection.joinConfig.channelId, currentMusicPlayerInfo.behaviour),
         files: createFiles(track)
      });
   };


   // defer the interaction
   const message = await interaction.deferReply({
      fetchReply: true
   });


   // set the music player info in the cache
   cache.set(`music-player:${interaction.guild.id}`, {
      robloxAssetId: track.robloxAssetId,
      behaviour
   });


   // connect to the channel
   const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channel.id,
      guildId: interaction.guild.id,
      selfDeaf: true,
      adapterCreator: interaction.guild.voiceAdapterCreator
   });


   // handle logic for the connection to the voice channel
   connection.on(`stateChange`, async (_oldState, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) { // the connection has been severed and was disconnected

         if (
            newState.reason === VoiceConnectionDisconnectReason.WebSocketClose // the bot was kicked from the voice channel - reconnecting is impossible
            && newState.closeCode === 4014                                     // the bot may have switched voice channels (which will automatically reconnect in a bit) or something else happened (do not try to reconnect!!)
         ) {
            // depending on what happened, the bot may reconnect and we can ignore this disconnect ever happened!
            try {
               // wait if the bot reconnects to the voice channel within the next five seconds
               await entersState(connection, VoiceConnectionStatus.Connecting, 5000);
            } catch {
               // assume that the bot was disconnected and destroy the connection
               connection.destroy();
            };

         } else if (connection.rejoinAttempts < 5) { // seems like this disconnect is recoverable; give a max of five reattempts to rejoin the voice channel
            await wait((connection.rejoinAttempts + 1) * 1000); // wait one second, multiplied by every rejoin attempt
            connection.rejoin(); // try to rejoin the voice channel

         } else // we did all we can, chef - just disconnect at this point
            connection.destroy();

      } else if (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling) { // the bot is trying to connect to the voice channel
         try {
            // wait if the bot reconnects to the voice channel within fifteen seconds
            await entersState(connection, VoiceConnectionStatus.Ready, 15000);
         } catch {
            if (connection.state.status !== VoiceConnectionStatus.Destroyed) // the bot couldn't connect, destroy the connection if it hasn't been already
               connection.destroy();
         };

      };
      // any other state changed aren't of any concern~
   });


   // create the audio player
   const player = createAudioPlayer();
   connection.subscribe(player);


   // play audio
   const playTrack = async audioFile => {
      const file             = createReadStream(`./assets/music-player/${audioFile}`);
      const { stream, type } = await demuxProbe(file);
      const resource         = createAudioResource(stream, {
         inputType: type
      });

      player.play(resource);
   };

   await playTrack(track.audioFile);


   // when the music player finishes..
   player.on(AudioPlayerStatus.Idle, async () => {
      if (behaviour === `loop-random`) { // play another random track
         const { robloxAssetId: previousTrackRobloxAssetId } = cache.get(`music-player:${interaction.guild.id}`);

         const newTrack = getTrack(previousTrackRobloxAssetId);
         await playTrack(newTrack.audioFile);

         cache.set(`music-player:${interaction.guild.id}`, {
            robloxAssetId: newTrack.robloxAssetId,
            behaviour
         });

         await interaction.channel.send({
            embeds: createEmbeds(newTrack, connection.joinConfig.channelId, behaviour),
            files: createFiles(newTrack),
            reply: {
               messageReference: message,
               failIfNotExists: false
            }
         });

      } else if (behaviour === `loop-track`) { // repeat the track
         await playTrack(track.audioFile);

      } else { // disconnect from the voice channel
         connection.destroy();
      };
   });


   // embeds
   const embeds = createEmbeds(track, connection.joinConfig.channelId, behaviour);


   // files
   const files = createFiles(track);


   // edit the deferred interaction
   await interaction.editReply({
      embeds,
      files
   });
};