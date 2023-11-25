export const name = "say";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`say`)
   .setDescription(`Make the bot say something in chat`)
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`message`)
         .setDescription(`Message content to send`)
         .setMaxLength(2000)
         .setRequired(false)
   )
   .addAttachmentOption(
      new Discord.SlashCommandAttachmentOption()
         .setName(`attachment`)
         .setDescription(`Attachment to upload`)
         .setRequired(false)
   )
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`reply-to-message-id`)
         .setDescription(`Reply to this message's id in the channel (@mention off)`)
         .setMinLength(17)
         .setMaxLength(19)
         .setRequired(false)
   );


import Discord from "discord.js";
import { strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const content    = interaction.options.getString(`message`);
   const attachment = interaction.options.getAttachment(`attachment`);
   const replyId    = interaction.options.getString(`reply-to-message-id`);


   // users
   const developers = JSON.parse(process.env.DEVELOPERS.replaceAll(`'`, `"`));

   const magicalbunny31 = developers[0];
   const halo           = process.env.USER_HALO;
   const mimi           = process.env.USER_MIMI;
   const yourstruly     = process.env.USER_YOURSTRULY;
   const ruby           = process.env.USER_RUBY;


   // this user can't use this command
   const allowedUsers = [ magicalbunny31, halo, mimi, yourstruly, ruby ];

   if (!allowedUsers.includes(interaction.user.id))
      return await interaction.reply({
         content: `🐰`,
         ephemeral: true
      });


   // empty message
   if (!content && !attachment)
      return await interaction.reply({
         content: strip`
            ### ❌ Invalid arguments
            > - At least one of \`message\` or \`attachment\` options are required.
         `,
         ephemeral: true
      });


   // attachment exceeds upload limit
   const fileUploadLimit = (() => {
      switch (interaction.guild.premiumTier) {
         default:                             return 2.5e+7;
         case Discord.GuildPremiumTier.Tier2: return 5e+7;
         case Discord.GuildPremiumTier.Tier3: return 1e+8;
      };
   })();

   if (attachment?.size > fileUploadLimit)
      return await interaction.reply({
         content: strip`
            ### ❌ Invalid argument
            > - \`attachment\` option file size exceeds this server's file upload limit.
         `,
         ephemeral: true
      });


   // reply to the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // send typing to the channel
   await interaction.channel.sendTyping();


   // send the message to this channel
   await interaction.channel.send({
      content,
      files: attachment
         ? [ attachment ]
         : [],
      reply: {
         messageReference: replyId,
         failIfNotExists: false
      },
      allowedMentions: {
         parse: []
      }
   });


   // delete the interaction's reply
   await interaction.deleteReply();
};