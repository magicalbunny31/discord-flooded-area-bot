export const name = "votekick";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`votekick`)
   .setDescription(`Call a votekick on a user`)
   .addUserOption(
      new Discord.SlashCommandUserOption()
         .setName(`user`)
         .setDescription(`The user to call a votekick on`)
         .setRequired(true)
   )
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`reason`)
         .setDescription(`The reason for this votekick`)
         .setMaxLength(128)
         .setRequired(true)
   );


import Discord from "discord.js";
import dayjs from "dayjs";
import { Timestamp } from "@google-cloud/firestore";
import { emojis, autoArray, choice, noop, strip } from "@magicalbunny31/awesome-utility-stuff";

import cache from "../../data/cache.js";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const user   = interaction.options.getUser(`user`);
   const reason = interaction.options.getString(`reason`);


   // this user isn't a part of this guild
   const member = interaction.options.getMember(`user`);

   if (!member)
      return await interaction.reply({
         content: `### ❌ ${user} isn't in this server.`,
         ephemeral: true
      });


   // trying to votekick someone already timed out
   if (member.communicationDisabledUntilTimestamp > Date.now())
      return await interaction.reply({
         content: `### ❌ ${user} is already timed out.`,
         ephemeral: true
      });


   // trying to votekick a bot
   if (user.bot)
      return await interaction.reply({
         content: `### ❌ ${user} is a bot.`,
         ephemeral: true
      });


   // trying to votekick someone who can't be timed out
   if (!member.moderatable) {
      // timeout the user for one minute
      if (interaction.member.moderatable)
         await interaction.member.timeout(60 * 1000);

      // reply to the interaction
      return await interaction.reply({
         content: `### 📢 ${interaction.user} is a nerd!`
      });
   };


   // votekick is on cooldown
   const { cooldownExpiresAt = 0, votekickInProgressAt = 0, currentVotekickMessage } = cache.get(`votekick`) || {};

   if (dayjs().unix() < cooldownExpiresAt)
      return await interaction.reply({
         content: strip`
            ### ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`votekick`, interaction.commandId)} is on cooldown!
            > - Try again ${Discord.time(cooldownExpiresAt, Discord.TimestampStyles.RelativeTime)}.
         `,
         ephemeral: true
      });


   // a votekick is in progress
   const votekickProbablyStillInProgress = dayjs().unix() - votekickInProgressAt < 120; // two minutes haven't passed yet: the votekick probably is still ongoing

   if (votekickInProgressAt && votekickProbablyStillInProgress)
      return await interaction.reply({
         content: `### 👞 A ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`votekick`, interaction.commandId)} is still in progress in the server!`,
         components: currentVotekickMessage
            ? [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.ButtonBuilder()
                        .setLabel(`View current /votekick`)
                        .setEmoji(`📨`)
                        .setStyle(Discord.ButtonStyle.Link)
                        .setURL(currentVotekickMessage)
                  )
            ]
            : [],
         ephemeral: true
      });


   // defer the interaction
   const message = await interaction.deferReply({
      fetchReply: true
   });


   // trying to votekick someone with votekick protection
   if (member.roles.cache.has(process.env.FA_ROLE_VOTEKICK_PROTECTION))
      return await interaction.editReply({
         content: strip`
            ### 📢 ${interaction.user} is a nerd!
            > - ${user} has ${Discord.roleMention(process.env.FA_ROLE_VOTEKICK_PROTECTION)}...
         `,
         allowedMentions: {
            roles: [],
            users: [ user.id ]
         }
      });


   // number of people required to votekick this user
   const requiredVotes = choice([
      2, 2, 2, 2,
      3, 3, 3,
      4, 4,
      5
   ]);

   const voters = [];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`${interaction.id}:/vote`)
               .setLabel(`/vote`)
               .setStyle(Discord.ButtonStyle.Primary)
         )
   ];


   // reply to the interaction
   const voteEndsAt = dayjs().add(2, `minutes`).unix();

   await interaction.editReply({
      content: strip`
         ### 👞 A votekick on ${user} has been started by ${interaction.user}.
         > - 📰 Reason: ${reason}
         > - 👥 ${requiredVotes} votes are required ${Discord.time(voteEndsAt, Discord.TimestampStyles.RelativeTime)}.
      `,
      components,
      allowedMentions: {
         users: [ user.id ],
         roles: []
      }
   });


   // set the votekick in progress
   cache.set(`votekick`, {
      votekickInProgressAt:   Math.floor(message.createdTimestamp / 1000),
      currentVotekickMessage: message.url
   });


   // create an InteractionCollector
   const vote = interaction.channel.createMessageComponentCollector({
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
      if (voters.some(voter => voter.includes(buttonInteraction.user.id)))
         return await buttonInteraction.deferUpdate();


      // add this user to the voters list (if it's not already reached its max)
      if (voters.length < requiredVotes)
         voters.push(`>  - 🗳️ ${buttonInteraction.user}`);


      // update the interaction
      await buttonInteraction.update({
         content: strip`
            ### 👞 A votekick on ${user} has been started by ${interaction.user}.
            > - 📰 Reason: ${reason}
            > - 👥 ${requiredVotes} votes are required ${Discord.time(voteEndsAt, Discord.TimestampStyles.RelativeTime)}.
            ${voters.join(`\n`)}
         `,
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
      // set the cooldown and votekick progress
      cache.set(`votekick`, {
         cooldownExpiresAt:      dayjs().add(30, `seconds`).unix(),
         votekickInProgressAt:   null,
         currentVotekickMessage: null
      });


      // didn't reach the required votes in the time
      if (endReason === `time`) {
         // add all unfilled voter spaces
         voters.push(
            ...autoArray(requiredVotes - voters.length, () => `>  - 🗳️`)
         );

         // disable the components
         for (const actionRow of components)
            for (const component of actionRow.components)
               component.data.disabled = true;

         // edit the original interaction's reply
         return await interaction.editReply({
            content: strip`
               ### ❌ Votekick on ${user} has failed.
               > - 📰 Reason: ${reason}
               > - ⌚ ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`votekick`, interaction.commandId)}s are now on cooldown for 30 seconds.
               ${voters.join(`\n`)}
            `,
            components: [],
            allowedMentions: {
               users: [ user.id ]
            }
         });
      };


      // InteractionCollector ended for some other reason
      if (endReason !== `required votes reached`)
         return;


      // time out the user depending on how many required votes there were
      const timedOutFor = requiredVotes * 60 * 500;

      await member.timeout(timedOutFor, `/votekick by ${interaction.user.tag}`);


      // edit the interaction's original reply
      return await interaction.editReply({
         content: strip`
            ### ✅ ${user} has been timed out for ${timedOutFor / (60 * 500)} minutes.
            > - 📰 Reason: ${reason}
            > - ⌚ ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`votekick`, interaction.commandId)}s are now on cooldown for 30 seconds.
            ${voters.join(`\n`)}
         `,
         components: [],
         allowedMentions: {
            users: [ user.id ]
         }
      });
   });
};