export const name = "mention";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`mention`)
   .setDescription(`@mention a role`)
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`role`)
         .setDescription(`The role to @mention`)
         .setChoices({
            name: `Moderation Team`,
            value: `FA_ROLE_MODERATION_TEAM`
         }, {
            name: `Events`,
            value: `FA_ROLE_EVENTS`
         }, {
            name: `Opinions`,
            value: `FA_ROLE_POLLS`
         }, {
            name: `Giveaways`,
            value: `FA_ROLE_GIVEAWAYS`
         }, {
            name: `Challenges`,
            value: `FA_ROLE_CHALLENGES`
         }, {
            name: `Playtest`,
            value: `FA_ROLE_PLAYTEST`
         })
         .setRequired(true)
   );


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
   const moderationTeam = process.env.FA_ROLE_MODERATION_TEAM;
   const eventHost      = process.env.FA_ROLE_EVENT_HOST;
   const challengeHost  = process.env.FA_ROLE_CHALLENGE_HOST;

   const events     = process.env.FA_ROLE_EVENTS;
   const challenges = process.env.FA_ROLE_CHALLENGES;


   // @Moderation Team or @Event Host role needed to @mention @Events
   if (![ moderationTeam, eventHost ].some(role => roles.has(role)) && roleId === events)
      return await interaction.reply({
         content: `### ❌ You need the roles ${Discord.roleMention(moderationTeam)} or ${Discord.roleMention(eventHost)} to @mention ${roleToMention}`,
         allowedMentions: {
            parse: []
         },
         ephemeral: true
      });


   // @Moderation Team or @Challenge Host role needed to @mention @Challenges
   if (![ moderationTeam, challengeHost ].some(role => roles.has(role)) && roleId === challenges)
      return await interaction.reply({
         content: `### ❌ You need the roles ${Discord.roleMention(moderationTeam)} or ${Discord.roleMention(challengeHost)} to @mention ${roleToMention}`,
         allowedMentions: {
            parse: []
         },
         ephemeral: true
      });


   // @Moderation Team role needed to @mention other roles
   if (!roles.has(moderationTeam) && ![ events, challenges ].includes(roleId))
      return await interaction.reply({
         content: `### ❌ You need the role ${Discord.roleMention(moderationTeam)} to @mention ${roleToMention}`,
         allowedMentions: {
            parse: []
         },
         ephemeral: true
      });


   // @mention this role
   await interaction.reply({
      content: roleToMention,
      allowedMentions: {
         roles: [ roleId ]
      }
   });
};