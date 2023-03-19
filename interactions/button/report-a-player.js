import Discord from "discord.js";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, updateResponse ] = interaction.customId.split(`:`);


   // defer the interaction
   if (!updateResponse)
      await interaction.deferReply({
         ephemeral: true
      });


   // this user is blacklisted
   const { members } = (await firestore.collection(`report-a-player`).doc(`blacklist`).get()).data();
   const { role: moderationTeam } = (await firestore.collection(`role`).doc(`moderation-team`).get()).data();

   if (members.includes(interaction.user.id))
      return await interaction.editReply({
         embeds: [
            new Discord.EmbedBuilder()
               .setColor(colours.red)
               .addFields({
                  name: `🚫 Cannot open menu`,
                  value: strip`
                     > You have been blacklisted from ${interaction.channel}.
                     > If you believe this is in error, contact a member of the ${Discord.roleMention(moderationTeam)}.
                  `
               })
         ],
         components: []
      });


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setTitle(`📣 Report a Player`)
         .setDescription(strip`
            ${emojis.bun_paw_wave} **Hello, ${interaction.user}!**
            > What are you making a report for?
         `)
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`pick-report-a-player-reason`)
               .setPlaceholder(`🏷️ Select a reason..`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🥾`)
                     .setLabel(`False votekicking`)
                     .setDescription(`You were votekicked for an unfair reason from a server.`)
                     .setValue(`false-votekicking`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`💣`)
                     .setLabel(`Griefing`)
                     .setDescription(`Another player destroyed your build.`)
                     .setValue(`griefing`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`💬`)
                     .setLabel(`Spamming`)
                     .setDescription(`Another player is flooding the chat.`)
                     .setValue(`spamming`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`💭`)
                     .setLabel(`Bypassing / Swearing`)
                     .setDescription(`Another player is saying inappropriate words.`)
                     .setValue(`bypassing`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🗯️`)
                     .setLabel(`Toxicity / Harassment`)
                     .setDescription(`Another player is being a constant bully.`)
                     .setValue(`toxicity`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🐛`)
                     .setLabel(`Bug abusing`)
                     .setDescription(`Another player is abusing a bug for unfair advantage.`)
                     .setValue(`bug-abuse`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`🪪`)
                     .setLabel(`Inappropriate player`)
                     .setDescription(`Another player is being inappropriate.`)
                     .setValue(`inappropriate-player`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`💢`)
                     .setLabel(`Bigotry`)
                     .setDescription(`Another player is being intolerant of others' opinions.`)
                     .setValue(`bigotry`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`💻`)
                     .setLabel(`Exploiting / Hacking`)
                     .setDescription(`Another player is using exploits.`)
                     .setValue(`exploiting`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`👥`)
                     .setLabel(`Ban evading`)
                     .setDescription(`A previously-banned player is evading a ban.`)
                     .setValue(`ban-evade`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setEmoji(`❓`)
                     .setLabel(`Other...`)
                     .setDescription(`You are reporting a player for a reason not listed here.`)
                     .setValue(`other`)
               )
         )
   ];


   // update the response, as this may have come from the "other" reason
   if (updateResponse === `true`)
      return await interaction.update({
         embeds,
         components
      });


   // edit the deferred interaction
   return await interaction.editReply({
      embeds,
      components
   });
};