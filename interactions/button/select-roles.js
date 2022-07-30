import Discord from "discord.js";
import { colours, emojis } from "@magicalbunny31/awesome-utility-stuff";

/**
 * show the reaction roles
 * @param {Discord.ButtonInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // roles
   const roles = interaction.member.roles.cache;

   const [ mentionRoles, pronounRoles ] = await redis
      .multi()
      .HGETALL(`flooded-area:role:mentions`)
      .HGETALL(`flooded-area:role:pronouns`)
      .exec();


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.SelectMenuBuilder()
               .setCustomId(`select-roles:mentions`)
               .setPlaceholder(`Select mention roles...`)
               .setOptions([
                  new Discord.SelectMenuOptionBuilder()
                     .setLabel(`Looking For Group`)
                     .setValue(`looking-for-group`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`looking-for-group`])),
                  new Discord.SelectMenuOptionBuilder()
                     .setLabel(`Events`)
                     .setValue(`events`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`events`])),
                  new Discord.SelectMenuOptionBuilder()
                     .setLabel(`Polls`)
                     .setValue(`polls`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`polls`])),
                  new Discord.SelectMenuOptionBuilder()
                     .setLabel(`Updates/Sneak Peaks`)
                     .setValue(`updates-sneak-peaks`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`updates-sneak-peaks`])),
                  new Discord.SelectMenuOptionBuilder()
                     .setLabel(`Giveaways`)
                     .setValue(`giveaways`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`giveaways`])),
                  new Discord.SelectMenuOptionBuilder()
                     .setLabel(`Challenges`)
                     .setValue(`challenges`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`challenges`])),
                  new Discord.SelectMenuOptionBuilder()
                     .setLabel(`Doruk's Exceptional Pings`)
                     .setValue(`doruk's-exceptional-pings`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(mentionRoles[`doruk's-exceptional-pings`]))
               ])
               .setMinValues(0)
               .setMaxValues(7)
         ]),
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.SelectMenuBuilder()
               .setCustomId(`select-roles:pronouns`)
               .setPlaceholder(`Select pronoun roles...`)
               .setOptions([
                  new Discord.SelectMenuOptionBuilder()
                     .setLabel(`He/Him`)
                     .setValue(`he-him`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(pronounRoles[`he-him`])),
                  new Discord.SelectMenuOptionBuilder()
                     .setLabel(`She/Her`)
                     .setValue(`she-her`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(pronounRoles[`she-her`])),
                  new Discord.SelectMenuOptionBuilder()
                     .setLabel(`They/Them`)
                     .setValue(`they-them`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(pronounRoles[`they-them`])),
                  new Discord.SelectMenuOptionBuilder()
                     .setLabel(`Ask For Pronouns`)
                     .setValue(`ask-for-pronouns`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(pronounRoles[`ask-for-pronouns`])),
                  new Discord.SelectMenuOptionBuilder()
                     .setLabel(`Other Pronouns`)
                     .setValue(`other-pronouns`)
                     .setEmoji(emojis.mention)
                     .setDefault(roles.has(pronounRoles[`other-pronouns`]))
               ])
               .setMinValues(0)
               .setMaxValues(5)
         ])
   ];


   // reply to the interaction
   // this is using a li'l trick to just show components owo
   return await interaction.reply({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setDescription(`boop`)
      ],
      components,
      flags: Discord.MessageFlags.SuppressEmbeds,
      ephemeral: true
   });
};