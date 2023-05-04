import Discord from "discord.js";
import dayjs from "dayjs";

import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, value, index ] = interaction.customId.split(`:`);


   // defer the interaction for removing notes, as it replies with a new response
   if (value === `remove-notes`)
      await interaction.deferReply({
         ephemeral: true
      });


   // "defer" the interaction (except for posting notes, as it shows a modal)
   else if (value !== `post-note`) {
      // set the booped button's emoji into a deferred state
      const actionRowIndex = interaction.message.components.flat().findIndex(({ components }) => components.find(component => component.customId === interaction.customId));
      const buttonIndex = interaction.message.components[actionRowIndex].components.findIndex(component => component.customId === interaction.customId);

      const boopedButtonEmoji = interaction.message.components[actionRowIndex].components[buttonIndex].emoji;

      Object.assign(interaction.message.components[actionRowIndex].components[buttonIndex].data, {
         emoji: Discord.parseEmoji(emojis.loading)
      });


      // "defer" the interaction

      // update the message if this is the same command user as the select menu booper (or if the message is ephemeral)
      if (interaction.user.id === interaction.message.interaction?.user.id || !interaction.message.interaction) {
         const disabledComponents = interaction.message.components.map(actionRow =>
            actionRow.components.map(component => !component.disabled)
         );

         for (const [ actionRowIndex, disabledComponentsActionRow ] of disabledComponents.entries())
            for (const [ componentIndex, disabledComponent ] of disabledComponentsActionRow.entries())
               if (disabledComponent)
                  interaction.message.components[actionRowIndex].components[componentIndex].data.disabled = true;

         await interaction.update({
            components: interaction.message.components
         });

         for (const [ actionRowIndex, disabledComponentsActionRow ] of disabledComponents.entries())
            for (const [ componentIndex, disabledComponent ] of disabledComponentsActionRow.entries())
               if (disabledComponent)
                  interaction.message.components[actionRowIndex].components[componentIndex].data.disabled = false;

      } else
         // this isn't the same person who used the command: create a new reply to the interaction
         await interaction.deferReply({
            ephemeral: true
         });


      // restore the "deferred" option's emoji
      Object.assign(interaction.message.components[actionRowIndex].components[buttonIndex].data, {
         emoji: boopedButtonEmoji
      });
   };


   // what each button does
   switch (value) {


      // post a note
      case `post-note`:
         return await interaction.showModal(
            new Discord.ModalBuilder()
            .setCustomId(`notes:${value}`)
            .setTitle(`📝 post a note`)
            .setComponents(
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.TextInputBuilder()
                        .setCustomId(`content`)
                        .setLabel(`NOTE`)
                        .setPlaceholder(`📰 type out your note..`)
                        .setStyle(Discord.TextInputStyle.Short)
                        .setMaxLength(128)
                        .setRequired(true)
                  )
            )
         );


      default: {
         // get notes
         let { notes = [] } = (await firestore.collection(`command`).doc(`notes`).get()).data();

         const isStaff = interaction.member.roles.cache.has(process.env.ROLE_MODERATION_TEAM);


         // remove and update outdated notes
         notes = notes.filter(note => note[`posted-at`].seconds > dayjs().subtract(1, `day`).unix());

         await firestore.collection(`command`).doc(`notes`).update({ notes });


         // sort the notes by time posted
         notes.sort((a, b) => b[`posted-at`].seconds - a[`posted-at`].seconds);


         // split the notes into chunks of five
         const splitArray = arr => {
            const size = 5;
            return Array.from(
               new Array(Math.ceil(arr.length / size)),
               (_element, i) => arr.slice(i * size, i * size + size)
            );
         };

         notes = splitArray(notes);


         // show all notes if this member is part of the moderation team, else show notes only made by this user
         const notesToShow = value === `scroll-notes`
            ? notes
            : isStaff
               ? notes
               : splitArray(
                  notes
                     .flat()
                     .filter(note => note.user === interaction.user.id)
               );


         // what each button does
         switch (value) {


            // remove notes
            case `remove-notes`: {
               // no notes to show
               if (!notesToShow.length) {
                  // disable the remove notes button if there aren't notes (else ignore it)
                  if (!notes.length) {
                     interaction.message.components[1].components[1].data.disabled = true;

                     return await interaction.editReply({
                        embeds: [
                           new Discord.EmbedBuilder(interaction.message.embeds[0].data)
                              .setDescription(`**\`no notes..\`** ${emojis.rip}`)
                        ],
                        components: interaction.message.components
                     });

                  } else
                     // delete the deferred interaction
                     return await interaction.deleteReply();
               };


               // embeds
               const embeds = [
                  new Discord.EmbedBuilder()
                     .setColor(colours.red)
                     .setAuthor({
                        name: `📰 the notes board`
                     })
                     .setDescription(
                        notesToShow[isStaff ? +index : 0]
                           ?.map(note => strip`
                              ${
                                 [
                                    `**${Discord.time(note[`posted-at`].seconds, Discord.TimestampStyles.RelativeTime)}**`,
                                    ...isStaff || note.user === interaction.user.id
                                       ? [ Discord.userMention(note.user) ]
                                       : []
                                 ]
                                    .join(` : `)
                              }
                              > ${note.content}
                           `)
                           .join(`\n\n`)
                           || `**\`no notes..\`** ${emojis.rip}`
                     )
                     .setFooter({
                        text: strip`
                           ⌚ notes expire after 24 hours
                           🕵️ anything added here is anonymous to others (excluding staff)
                           ❗ posting anything that breaks the rules will be moderated
                        `
                     })
               ];


               // components
               const components = [
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.ButtonBuilder()
                           .setCustomId(`notes:scroll-remove-notes:${+index - 1}`)
                           .setEmoji(`⬅️`)
                           .setStyle(Discord.ButtonStyle.Primary)
                           .setDisabled(+index - 1 < 0),
                        new Discord.ButtonBuilder()
                           .setCustomId(`notes:scroll-remove-notes:${+index + 1}`)
                           .setEmoji(`➡️`)
                           .setStyle(Discord.ButtonStyle.Primary)
                           .setDisabled(notesToShow.length <= +index + 1)
                     ),

                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.StringSelectMenuBuilder()
                           .setCustomId(`notes:${index}`)
                           .setPlaceholder(`select notes to remove.. 🗑️`)
                           .setMaxValues(notesToShow[isStaff ? +index : 0]?.length)
                           .setOptions(
                              await Promise.all(
                                 notesToShow[isStaff ? +index : 0]
                                    .map(async (note, i) =>
                                       new Discord.StringSelectMenuOptionBuilder()
                                          .setLabel(note.content.length > 100 ? `${note.content.slice(0, 98)}..` : note.content)
                                          .setValue(note.id)
                                          .setDescription(`${(await interaction.client.users.fetch(note.user)).tag} : ${dayjs.duration(note[`posted-at`].seconds - dayjs().unix(), `seconds`).humanize(true)}`)
                                    )
                              )
                           )
                     )
               ];


               // edit the deferred interaction
               return await interaction.editReply({
                  embeds,
                  components
               });
            };


            // change pages
            default: {
               const i = +index >= notesToShow.length - 1
                  ? notesToShow.length
                     ? notesToShow.length - 1
                     : 0
                  : +index;


               // embeds
               const embeds = [
                  new Discord.EmbedBuilder()
                     .setColor(value === `scroll-notes` ? colours.flooded_area : colours.red)
                     .setAuthor({
                        name: `📰 the notes board`
                     })
                     .setDescription(
                        notesToShow[i]
                           ?.map(note => strip`
                              ${
                                 value === `scroll-notes`
                                    ? `**${Discord.time(note[`posted-at`].seconds, Discord.TimestampStyles.RelativeTime)}**`
                                    : [
                                       `**${Discord.time(note[`posted-at`].seconds, Discord.TimestampStyles.RelativeTime)}**`,
                                       ...isStaff || note.user === interaction.user.id
                                          ? [ Discord.userMention(note.user) ]
                                          : []
                                    ]
                                       .join(` : `)
                              }
                              > ${note.content}
                           `)
                           .join(`\n\n`)
                           || `**\`no notes..\`** ${emojis.rip}`
                     )
                     .setFooter({
                        text: strip`
                           ⌚ notes expire after 24 hours
                           🕵️ anything added here is anonymous to others (excluding staff)
                           ❗ posting anything that breaks the rules will be moderated
                        `
                     })
               ];


               // components
               const components = [
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.ButtonBuilder()
                           .setCustomId(`notes:${value}:${i - 1}`)
                           .setEmoji(`⬅️`)
                           .setStyle(Discord.ButtonStyle.Primary)
                           .setDisabled(i - 1 < 0),
                        new Discord.ButtonBuilder()
                           .setCustomId(`notes:${value}:${i + 1}`)
                           .setEmoji(`➡️`)
                           .setStyle(Discord.ButtonStyle.Primary)
                           .setDisabled(notesToShow.length <= i + 1)
                     ),

                  ...value === `scroll-notes`
                     ? [
                        new Discord.ActionRowBuilder()
                           .setComponents(
                              new Discord.ButtonBuilder()
                                 .setCustomId(`notes:post-note`)
                                 .setLabel(`post a note`)
                                 .setEmoji(`📝`)
                                 .setStyle(Discord.ButtonStyle.Success),

                              ...isStaff || notesToShow.flat().find(note => note.user === interaction.user.id)
                                 ? [
                                    new Discord.ButtonBuilder()
                                       .setCustomId(`notes:remove-notes:${i}`)
                                       .setLabel(isStaff ? `remove notes` : `remove your notes`)
                                       .setEmoji(`🗑️`)
                                       .setStyle(Discord.ButtonStyle.Danger)
                                       .setDisabled(!notesToShow.length)
                                 ]
                                 : []
                           )
                     ]
                     : [
                        new Discord.ActionRowBuilder()
                           .setComponents(
                              new Discord.StringSelectMenuBuilder()
                                 .setCustomId(`notes:${i}`)
                                 .setPlaceholder(`select notes to remove.. 🗑️`)
                                 .setMaxValues(notesToShow[i]?.length)
                                 .setOptions(
                                    await Promise.all(
                                       notesToShow[i]
                                          .map(async note =>
                                             new Discord.StringSelectMenuOptionBuilder()
                                                .setLabel(note.content.length > 100 ? `${note.content.slice(0, 98)}..` : note.content)
                                                .setValue(note.id)
                                                .setDescription(`${(await interaction.client.users.fetch(note.user)).tag} : ${dayjs.duration(note[`posted-at`].seconds - dayjs().unix(), `seconds`).humanize(true)}`)
                                          )
                                    )
                                 )
                           )
                     ]
               ];


               // edit the deferred interaction
               return await interaction.editReply({
                  embeds,
                  components
               });
            };


         };
      };


   };
};