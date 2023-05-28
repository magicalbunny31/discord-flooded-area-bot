export const data = new Discord.SlashCommandBuilder()
   .setName(`mention`)
   .setDescription(`📣 @mention a role`)
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`role`)
         .setDescription(`📛 the role to @mention`)
         .setChoices({
            name: `Moderation Team`,
            value: `ROLE_MODERATION_TEAM`
         }, {
            name: `Events`,
            value: `ROLE_EVENTS`
         }, {
            name: `Polls`,
            value: `ROLE_POLLS`
         }, {
            name: `Giveaways`,
            value: `ROLE_GIVEAWAYS`
         }, {
            name: `Challenges`,
            value: `ROLE_CHALLENGES`
         }, {
            name: `Doruk's Exceptional Pings`,
            value: `ROLE_DORUKS_EXCEPTIONAL_PINGS`
         })
         .setRequired(true)
   )
   .setDefaultMemberPermissions(Discord.PermissionFlagsBits.MentionEveryone);

export const guildOnly = true;


import Discord from "discord.js";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const role = interaction.options.getString(`role`);


   // the role to mention
   const roleId        = process.env[role];
   const roleToMention = Discord.roleMention(roleId);


   // this member's roles
   const roles = interaction.member.roles.cache;


   // role constants
   const moderationTeam = process.env.ROLE_MODERATION_TEAM;
   const eventHost      = process.env.ROLE_EVENT_HOST;
   const challengeHost  = process.env.ROLE_CHALLENGE_HOST;

   const events     = process.env.ROLE_EVENTS;
   const challenges = process.env.ROLE_CHALLENGES;


   // @Moderation Team or @Event Host role needed to @mention @Events
   if (![ eventHost ].some(role => roles.has(role)) && roleId === events)
      return await interaction.reply({
         content: `❌ **You need the roles ${Discord.roleMention(moderationTeam)} or ${Discord.roleMention(eventHost)} to @mention ${roleToMention}.**`,
         allowedMentions: {
            parse: []
         },
         ephemeral: true
      });


   // @Moderation Team or @Challenge Host role needed to @mention @Challenges
   if (![ challengeHost ].some(role => roles.has(role)) && roleId === challenges)
      return await interaction.reply({
         content: `❌ **You need the roles ${Discord.roleMention(moderationTeam)} or ${Discord.roleMention(challengeHost)} to @mention ${roleToMention}.**`,
         allowedMentions: {
            parse: []
         },
         ephemeral: true
      });


   // @Moderation Team role needed to @mention other roles
   if (!roles.has(moderationTeam))
      return await interaction.reply({
         content: `❌ **You need the role ${Discord.roleMention(moderationTeam)} to @mention ${roleToMention}.**`,
         allowedMentions: {
            parse: []
         },
         ephemeral: true
      });


   // @mention this role
   return await interaction.reply({
      content: roleToMention,
      allowedMentions: {
         roles: [ roleId ]
      }
   });
};