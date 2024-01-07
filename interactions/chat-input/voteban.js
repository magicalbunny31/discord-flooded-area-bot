export const name = "voteban";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`voteban`)
   .setDescription(`Call a voteban on a user`)
   .addUserOption(
      new Discord.SlashCommandUserOption()
         .setName(`user`)
         .setDescription(`The user to call a voteban on`)
         .setRequired(true)
   )
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`reason`)
         .setDescription(`The reason for this voteban`)
         .setMaxLength(128)
         .setRequired(true)
   )
   .addIntegerOption(
      new Discord.SlashCommandIntegerOption()
         .setName(`required-votes`)
         .setDescription(`The number of votes required for this voteban to pass`)
         .setMinValue(10)
         .setMaxValue(999)
         .setRequired(true)
   )
   .addIntegerOption(
      new Discord.SlashCommandIntegerOption()
         .setName(`length`)
         .setDescription(`How long to gather votes for this voteban, in minutes`)
         .setMinValue(2)
         .setMaxValue(30)
         .setRequired(true)
   )
   .setDefaultMemberPermissions(Discord.PermissionFlagsBits.Administrator);


import Discord from "discord.js";
import dayjs from "dayjs";
import { autoArray, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const user          = interaction.options.getUser(`user`);
   const reason        = interaction.options.getString(`reason`);
   const requiredVotes = interaction.options.getInteger(`required-votes`);
   const length        = interaction.options.getInteger(`length`);


   // emojis
   const wojtekhugo = `<:wojtekhugo:961682416496427118>`;


   // this person doesn't have all perms
   if (!interaction.member.roles.cache.has(process.env.FA_ROLE_ALL_PERMS))
      return await interaction.reply({
         content: `### ❌ Only members with ${Discord.roleMention(process.env.FA_ROLE_ALL_PERMS)} can use this command`,
         ephemeral: true
      });


   // this user isn't a part of this guild
   const member = interaction.options.getMember(`user`);

   if (!member)
      return await interaction.reply({
         content: `### ❌ ${user} isn't in this server`,
         ephemeral: true
      });


   // trying to votekick a bot
   if (user.bot)
      return await interaction.reply({
         content: `### ❌ ${user} is a bot`,
         ephemeral: true
      });


   // trying to votekick someone who can't be banned
   if (member.roles.cache.has(process.env.FA_ROLE_MODERATION_TEAM) || !member.bannable)
      return await interaction.reply({
         content: `### ❌ ${user} can't be banned`,
         ephemeral: true
      });


   // defer the interaction
   const message = await interaction.deferReply({
      fetchReply: true
   });


   // voters for this voteban
   const voters = [];


   // reply to the interaction
   const voteEndsAt = dayjs().add(length, `minutes`).unix();

   await interaction.editReply({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(0x010101)
            .setDescription(strip`
               ### ${wojtekhugo} A voteban on ${user} has been started
               > - 📰 Reason: ${reason}
               > - 👥 \`0\` / ${requiredVotes} votes are required ${Discord.time(voteEndsAt, Discord.TimestampStyles.RelativeTime)}.
            `)
            .setThumbnail(`attachment://axetal.png`)
      ],
      components: [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(`${interaction.id}:/vote`)
                  .setLabel(`/vote`)
                  .setStyle(Discord.ButtonStyle.Primary)
            )
      ],
      files: [
         new Discord.AttachmentBuilder()
            .setFile(`./assets/voteban/axetal.png`)
      ],
      allowedMentions: {
         users: [ user.id ],
         roles: []
      }
   });


   // create an InteractionCollector
   const vote = message.createMessageComponentCollector({
      filter: i => i.customId.startsWith(interaction.id),
      time: 120000
   });


   // count a vote
   vote.on(`collect`, async buttonInteraction => {
      // this user called the votekick
      if (buttonInteraction.user.id === interaction.user.id)
         return await buttonInteraction.deferUpdate();


      // this user is being votekicked
      if (buttonInteraction.user.id === user.id)
         return await buttonInteraction.deferUpdate();


      // this user is votekick banned
      if (buttonInteraction.member.roles.cache.has(process.env.FA_ROLE_VOTEKICK_BANNED))
         return await buttonInteraction.deferUpdate();


      // this user has already voted
      if (voters.includes(buttonInteraction.user.id))
         return await buttonInteraction.deferUpdate();


      // add this user to the voters list (if it's not already reached its max)
      if (voters.length < requiredVotes)
         voters.push(buttonInteraction.user.id);


      // update the interaction
      await buttonInteraction.update({
         embeds: [
            new Discord.EmbedBuilder()
               .setColor(0x010101)
               .setDescription(strip`
                  ### ${wojtekhugo} A voteban on ${user} has been started
                  > - 📰 Reason: ${reason}
                  > - 👥 \`${voters.length}\` / ${requiredVotes} votes are required ${Discord.time(voteEndsAt, Discord.TimestampStyles.RelativeTime)}.
               `)
               .setThumbnail(`attachment://axetal.png`)
         ],
         allowedMentions: {
            users: [ user.id ],
            roles: []
         }
      });


      // the required amount of votes have been reached
      if (voters.length >= requiredVotes)
         vote.stop(`required votes reached`);
   });


   vote.on(`end`, async (collected, endReason) => {
      // didn't reach the required votes in the time
      if (endReason === `time`) {
         // edit the original interaction's reply
         return await interaction.editReply({
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(0x010101)
                  .setDescription(strip`
                     ### ${wojtekhugo} Voteban on ${user} has failed
                     > - 📰 Reason: ${reason}
                     > - 👥 \`${voters.length}\` / ${requiredVotes} votes
                  `)
                  .setThumbnail(`attachment://axetal.png`)
            ],
            components: [],
            allowedMentions: {
               users: [ user.id ]
            }
         });
      };


      // InteractionCollector ended for some other reason
      if (endReason !== `required votes reached`)
         return;


      // ban the person
      await member.ban({ reason: `/voteban by ${interaction.user.tag}: "${reason}"` });


      // edit the interaction's original reply
      await interaction.editReply({
         embeds: [
            new Discord.EmbedBuilder()
               .setColor(0x010101)
               .setDescription(strip`
                  ### ${wojtekhugo} ${user} has been BANNED
                  > - 📰 Reason: ${reason}
                  > - 👥 \`${voters.length}\` / ${requiredVotes} votes
               `)
               .setThumbnail(`attachment://axetal.png`)
         ],
         components: [],
         allowedMentions: {
            users: [ user.id ]
         }
      });
   });
};