export const data = new Discord.SlashCommandBuilder()
   .setName(`votekick`)
   .setDescription(`📣 call a votekick on someone`)
   .addUserOption(
      new Discord.SlashCommandUserOption()
         .setName(`user`)
         .setDescription(`👥 user to votekick`)
         .setRequired(true)
   )
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`reason`)
         .setDescription(`📝 reason for the votekick`)
         .setMaxLength(128)
         .setRequired(true)
   );


import Discord from "discord.js";
import dayjs from "dayjs";

import { emojis, autoArray, number, strip } from "@magicalbunny31/awesome-utility-stuff";

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
         content: `i'm not sure if you've realised this but ${user} isn't in this server`,
         ephemeral: true
      });


   // trying to votekick someone who can't be timed out
   if (!member.moderatable) {
      // timeout the user for one minute
      if (interaction.member.moderatable)
         await interaction.member.timeout(60 * 1000);

      // reply to the interaction
      return await interaction.reply({
         content: `📣 **${interaction.user} is a nerd**`
      });
   };


   // number of people required to votekick this user
   const requiredVotes = number(5, 10);

   const voters = autoArray(requiredVotes, () => `> 👥 ${emojis.loading}`);


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
   const voteEndsAt = dayjs().add(60, `seconds`).unix();

   await interaction.reply({
      content: strip`
         📣 **a votekick on ${user} has been started by ${interaction.user} for the reason of \`${reason}\`**
         📰 **${requiredVotes} votes are needed ${Discord.time(voteEndsAt, Discord.TimestampStyles.RelativeTime)}**
         ${voters.join(`\n`)}
      `,
      components,
      allowedMentions: {
         users: [ user.id ]
      }
   });


   // create an InteractionCollector
   const vote = interaction.channel.createMessageComponentCollector({
      filter: i => i.customId.startsWith(interaction.id),
      time: 60000
   });


   // count a vote
   vote.on(`collect`, async buttonInteraction => {
      // this person is calling the votekick
      if (buttonInteraction.user.id === interaction.user.id)
         return await buttonInteraction.deferUpdate();


      // can't votekick self
      if (buttonInteraction.user.id === user.id)
         return await buttonInteraction.deferUpdate();


      // this user has already voted
      if (voters.some(voter => voter.includes(buttonInteraction.user.id)))
         return await buttonInteraction.deferUpdate();


      // add this user to the voters list
      const indexOfSpace = voters.findIndex(voter => voter.includes(emojis.loading));
      voters.splice(indexOfSpace, 1, `> 👥 ${buttonInteraction.user}`);


      // update the interaction
      await buttonInteraction.update({
         content: strip`
            📣 **a votekick on ${user} has been started by ${interaction.user} for the reason of \`${reason}\`**
            📰 **${requiredVotes} votes are needed ${Discord.time(voteEndsAt, Discord.TimestampStyles.RelativeTime)}**
            ${voters.join(`\n`)}
         `,
         allowedMentions: {
            users: [ user.id ]
         }
      });


      // the required amount of votes have been reached
      if (voters.every(voter => !voter.includes(emojis.loading)))
         vote.stop(`required votes reached`);
   });


   vote.on(`end`, async (collected, reason) => {
      // didn't reach the required votes in the time
      if (reason === `time`) {
         // replace all unfilled voter spaces with an x
         for (let i = 0; i < voters.length; i ++) {
            if (!voters[i].includes(emojis.loading))
               continue;

            voters[i] = `> 👥 ❌`;
         };

         // disable the components
         for (const actionRow of components)
            for (const component of actionRow.components)
               component.data.disabled = true;

         // edit the original interaction's reply
         return await interaction.editReply({
            content: strip`
               📣 **votekick on ${user} has failed**
               ⌚ **30 second cooldown on more ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`votekick`, interaction.client.application.id)}s**
               ${voters.join(`\n`)}
            `,
            components: [],
            allowedMentions: {
               users: [ user.id ]
            }
         });
      };


      // InteractionCollector ended for some other reason
      if (reason !== `required votes reached`)
         return;


      // time out the user depending on how many required votes there were
      const timedOutFor = requiredVotes * 60 * 1000;

      await member.timeout(timedOutFor, `/votekick by ${interaction.user.tag}`);


      // edit the interaction's original reply
      return await interaction.editReply({
         content: strip`
            📣 **${user} has been ~~timed out~~ kicked with ${requiredVotes} votes**
            ⌚ **30 second cooldown on more ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`votekick`, interaction.client.application.id)}s**
            ${voters.join(`\n`)}
         `,
         components: [],
         allowedMentions: {
            users: [ user.id ]
         }
      });
   });
};