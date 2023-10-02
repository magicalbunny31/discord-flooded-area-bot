export const name = "suggestions-change-status";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import { strip } from "@magicalbunny31/awesome-utility-stuff/types";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, action ] = interaction.customId.split(`:`);


   // this member isn't staff
   if (!interaction.member.roles.cache.has(process.env.FA_ROLE_MODERATION_TEAM))
      return await interaction.reply({
         content: strip`
            ### ❌ Can't update post
            > - You must be part of the ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} to do this.
         `,
         ephemeral: true
      });


   // this isn't a suggestion thread
   if (![ process.env.FA_CHANNEL_GAME_SUGGESTIONS, process.env.FA_CHANNEL_SERVER_SUGGESTIONS, process.env.FA_CHANNEL_PART_SUGGESTIONS ].includes(interaction.channel?.parent?.id))
      return await interaction.reply({
         content: strip`
            ### ❌ Can't update post
            > - This isn't a post in ${Discord.channelMention(process.env.FA_CHANNEL_GAME_SUGGESTIONS)}, ${Discord.channelMention(process.env.FA_CHANNEL_SERVER_SUGGESTIONS)}, or ${Discord.channelMention(process.env.FA_CHANNEL_PART_SUGGESTIONS)}.
         `,
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // do this action
   switch (action) {


      case `lock`: {
         // lock this post
         await interaction.channel.setLocked(true);

         // edit the deferred interaction
         return await interaction.editReply({
            content: strip`
               ### ✅ Post updated
               > - ${interaction.channel} has been locked.
            `
         });
      };


      case `close`: {
         // lock this post
         await interaction.channel.setLocked(true);

         // close this post
         await interaction.channel.setArchived(true);

         // edit the deferred interaction
         return await interaction.editReply({
            content: strip`
               ### ✅ Post updated
               > - ${interaction.channel} has been locked and closed.
            `
         });
      };


   };
};