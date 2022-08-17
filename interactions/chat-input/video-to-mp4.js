import Discord from "discord.js";

import stream from "stream";
import FFmpeg from "fluent-ffmpeg";

import { emojis, colours, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * convert a video file to the mp4 file format
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   const attachment = interaction.options.getAttachment(`video`);


   // file type is already mp4
   if (attachment.url.endsWith(`mp4`))
      return await interaction.reply({
         content: strip`
            ❌ **Cannot convert this file.**
            > This file's type is already of type \`.mp4\`.
         `,
         ephemeral: true
      });


   // check this file format if it can be converted to a video or not
   if (!attachment.contentType.startsWith(`video`))
      return await interaction.reply({
         content: strip`
            ❌ **Cannot convert this file.**
            > This file isn't a video.
         `,
         ephemeral: true
      });


   // reply to the interaction
   await interaction.reply({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setDescription(strip`
               ✅ Received command
               ${emojis.loading} Downloading video...
               ${emojis.foxsleep} Convert video to \`.mp4\`
               ${emojis.foxsleep} Re-upload video
            `)
      ],
      ephemeral: true
   });


   // get the attachment as a buffer
   const response = await fetch(attachment.url);
   const readableStream = stream.Readable.from(
      Buffer.from(await response.arrayBuffer()),
      {
         objectMode: false
      }
   );


   await interaction.editReply({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setDescription(strip`
               ✅ Received command
               ✅ Downloaded video
               ${emojis.loading} Converting video to \`.mp4\`...
               ${emojis.foxsleep} Re-upload video
            `)
      ]
   });


   // convert the video
   const bufferStream = new stream.PassThrough();

   new FFmpeg(readableStream)
      .format(`matroska`)
      .writeToStream(bufferStream);

   const buffer = await new Promise((resolve, reject) => {
      const buffers = [];
      bufferStream
         .on(`data`, buffer => buffers.push(buffer))
         .on(`end`, () => resolve(Buffer.concat(buffers)))
         .on(`error`, error => reject(new Error(error)));
   });

   await interaction.editReply({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setDescription(strip`
               ✅ Received command
               ✅ Downloaded video
               ✅ Converted video to \`.mp4\`
               ${emojis.loading} Re-uploading video...
            `)
      ]
   });


   // file is too big for this server's boost level
   const fileUploadLimit = (() => {
      switch (interaction.guild.premiumTier) {
         case 1: return 8388608;   //   8 MiB to bytes
         case 2: return 52428800;  //  50 MiB to bytes
         case 3: return 104857600; // 100 MiB to bytes
      };
   })();

   if (buffer.length > fileUploadLimit)
      return await interaction.editReply({
         embeds: [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setDescription(strip`
                  ✅ Received command
                  ✅ Downloaded video
                  ✅ Converted video to \`.mp4\`
                  ❌ Re-uploading video...
               `)
               .setFooter({
                  text: `💭 The output file is too large to send to this server.`
               }),
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setDescription(`ℹ️ Consider using a video hosting service like [Streamable](https://streamable.com) to upload and ephemerally host your video.`)
         ]
      });


   // edit the interaction's original response
   return await interaction.editReply({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setDescription(strip`
               ✅ Received command
               ✅ Downloaded video
               ✅ Converted video to \`.mp4\`
               ✅ Re-uploaded video
            `)
            .setFooter({
               text: strip`
                  📂 You can now download this video and send it to a channel!
                  🔗 Do not share the link to the video: it will be deleted later.
               `
            })
      ],
      files: [
         new Discord.AttachmentBuilder()
            .setName(`video.mp4`)
            .setFile(buffer)
      ]
   });
};