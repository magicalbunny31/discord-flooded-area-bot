import Discord from "discord.js";
import dayjs from "dayjs";

import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.AnySelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu, index = 0 ] = interaction.customId.split(`:`);
   const notesToRemove = interaction.values;


   // set the selected value(s) as default in its select menu
   if (interaction.isStringSelectMenu()) {
      const selectMenuIndex = interaction.message.components.flat().findIndex(({ components }) => components[0].customId === interaction.customId);
      const selectedValuesIndexes = notesToRemove.map(value => interaction.message.components[selectMenuIndex].components[0].options.findIndex(option => option.value === value));

      for (const option of interaction.message.components[selectMenuIndex].components[0].options)
         option.default = false;

      for (const selectedValuesIndex of selectedValuesIndexes)
         Object.assign(interaction.message.components[selectMenuIndex].components[0].options[selectedValuesIndex], {
            emoji: Discord.parseEmoji(emojis.loading),
            default: true
         });
   };


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

   } else
      // this isn't the same person who used the command: create a new reply to the interaction
      await interaction.deferReply({
         ephemeral: true
      });


   // get notes
   let { notes = [] } = (await firestore.collection(`command`).doc(`notes`).get()).data();

   const isStaff = interaction.member.roles.cache.has(process.env.ROLE_MODERATION_TEAM);


   // remove notes
   for (const noteToRemove of notesToRemove) {
      const indexToRemove = notes.findIndex(note => note.id === noteToRemove);

      if (indexToRemove !== -1)
         notes.splice(indexToRemove, 1);
   };


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
   const notesToShow = isStaff
      ? notes
      : splitArray(
         notes
            .flat()
            .filter(note => note.user === interaction.user.id)
      );


   // get the index of the notes to show
   const i = +index >= notesToShow.length - 1
      ? notesToShow.length
         ? notesToShow.length - 1
         : 0
      : +index;


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.red)
         .setAuthor({
            name: `📰 the notes board`
         })
         .setDescription(
            notesToShow[isStaff ? i : 0]
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
               .setCustomId(`notes:scroll-remove-notes:${i - 1}`)
               .setEmoji(`⬅️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(i - 1 < 0),
            new Discord.ButtonBuilder()
               .setCustomId(`notes:scroll-remove-notes:${i + 1}`)
               .setEmoji(`➡️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(notesToShow.length <= i + 1)
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`notes`)
               .setPlaceholder(`select notes to remove.. 🗑️`)
               .setMaxValues(notesToShow[isStaff ? i : 0]?.length || 1)
               .setOptions(
                  notesToShow[isStaff ? i : 0]
                     ? await Promise.all(
                        notesToShow[isStaff ? i : 0]
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
               .setDisabled(!notesToShow[isStaff ? i : 0]?.length)
         )
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds,
      components
   });
};