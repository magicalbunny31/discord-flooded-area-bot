export const data = new Discord.SlashCommandBuilder()
   .setName(`notes`)
   .setDescription(`🗒️ anonymously view and add notes to the board`);

export const guildOnly = true;


import Discord from "discord.js";
import dayjs from "dayjs";

import { colours, emojis, strip, wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // function to try to fetch something or return undefined instead of throwing
   const tryOrUndefined = async promise => {
      try {
         return await promise;
      } catch {
         return undefined;
      };
   };


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // get notes
   let { notes = [] } = (await firestore.collection(`command`).doc(`notes`).get()).data();

   const { role: moderationTeam } = (await firestore.collection(`role`).doc(`moderation-team`).get()).data();
   const isStaff = interaction.member.roles.cache.has(moderationTeam);


   // remove and update outdated notes
   notes = notes.filter(note => note[`posted-at`].seconds > dayjs().subtract(1, `day`).unix());

   await firestore.collection(`command`).doc(`notes`).update({ notes });


   // sort the notes by time posted
   notes.sort((a, b) => b[`posted-at`].seconds - a[`posted-at`].seconds);


   // split the notes into chunks of five
   const size = 5;
   notes = Array.from(
      new Array(Math.ceil(notes.length / size)),
      (_element, i) => notes.slice(i * size, i * size + size)
   );


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setAuthor({
            name: `📰 the notes board`
         })
         .setDescription(
            notes[0]
               ?.map(note => strip`
                  **${Discord.time(note[`posted-at`].seconds, Discord.TimestampStyles.RelativeTime)}**
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
               .setCustomId(`notes:scroll-notes:-1`)
               .setEmoji(`⬅️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(true),
            new Discord.ButtonBuilder()
               .setCustomId(`notes:scroll-notes:1`)
               .setEmoji(`➡️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(notes.length <= 1)
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`notes:post-note`)
               .setLabel(`post a note`)
               .setEmoji(`📝`)
               .setStyle(Discord.ButtonStyle.Success),

            ...isStaff || notes.flat().find(note => note.user === interaction.user.id)
               ? [
                  new Discord.ButtonBuilder()
                     .setCustomId(`notes:remove-notes:0`)
                     .setLabel(isStaff ? `remove notes` : `remove your notes`)
                     .setEmoji(`🗑️`)
                     .setStyle(Discord.ButtonStyle.Danger)
                     .setDisabled(!notes.length)
               ]
               : []
         )
   ];


   // edit the deferred interaction
   await interaction.editReply({
      content: `${emojis.loading} *refreshing ${Discord.time(dayjs().add(10, `seconds`).unix(), Discord.TimestampStyles.RelativeTime)}..*`,
      embeds,
      components
   });


   // refresh the notes
   for (let refreshNotesIndex = 0; refreshNotesIndex < 6 * 5; refreshNotesIndex ++) {
      // wait 9 seconds (assume that fetching and updating the message takes 1 second)
      await wait(9000);


      // try to fetch the interaction's original reply
      const message = await tryOrUndefined(interaction.fetchReply());


      // couldn't fetch the reply, assume it was deleted and stop here
      if (!message)
         return;


      // button info
      const [ _button, value, index ] = message.components[0].components[0].customId.split(`:`);


      // get notes
      let { notes = [] } = (await firestore.collection(`command`).doc(`notes`).get()).data();

      const { role: moderationTeam } = (await firestore.collection(`role`).doc(`moderation-team`).get()).data();
      const isStaff = interaction.member.roles.cache.has(moderationTeam);


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


      // what index the current page is (or should be)
      const i = (+index + 1) >= notesToShow.length - 1
         ? notesToShow.length
            ? notesToShow.length - 1
            : 0
         : +index + 1;


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
                     **${Discord.time(note[`posted-at`].seconds, Discord.TimestampStyles.RelativeTime)}**
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
                        .setMaxValues(notesToShow[i]?.length || 1)
                        .setOptions(
                           notesToShow[i]
                              ? await Promise.all(
                                 notesToShow[i]
                                    ?.map(async note =>
                                       new Discord.StringSelectMenuOptionBuilder()
                                          .setLabel(note.content.length > 100 ? `${note.content.slice(0, 98)}..` : note.content)
                                          .setValue(note.id)
                                          .setDescription(`${(await interaction.client.users.fetch(note.user)).tag} : ${dayjs.duration(note[`posted-at`].seconds - dayjs().unix(), `seconds`).humanize(true)}`)
                                    )
                              )
                              : new Discord.StringSelectMenuOptionBuilder()
                                 .setLabel(`uwu`)
                                 .setValue(`owo`)
                        )
                  )
            ]
      ];


      try {
         // edit the deferred interaction
         await interaction.editReply({
            content: refreshNotesIndex === (6 * 5) - 1
               ? `💣 *notes finished refreshing, self-destructing ${Discord.time(dayjs().add(5, `minutes`).unix(), Discord.TimestampStyles.RelativeTime)}..*`
               : `${emojis.loading} *refreshing ${Discord.time(dayjs().add(10, `seconds`).unix(), Discord.TimestampStyles.RelativeTime)}..*`,
            embeds,
            components
         });

      } catch {
         // uhh that didn't work, ignore whatever just happened
         return;
      };
   };


   // five minutes have passed, wait another five minutes before deleting the interaction's original response
   await wait(300000);


   // try to delete the interaction's original response
   try {
      await interaction.deleteReply();

   } catch {
      return;
   };
};