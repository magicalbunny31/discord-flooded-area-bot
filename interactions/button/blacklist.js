import Discord from "discord.js";
import { emojis, colours } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, index = 0 ] = interaction.customId.split(`:`);


   // function to try to fetch something or return undefined instead of throwing
   const tryOrUndefined = async promise => {
      try {
         return await promise;
      } catch {
         return undefined;
      };
   };


   // function to check if a user is in this guild
   const userIsInGuild = async userId => !!await tryOrUndefined(interaction.guild.members.fetch(userId));


   // this interaction isn't from an already-existing message
   if (interaction.message.embeds[0].title === `🔧 Ticket Settings`)
      await interaction.deferReply({
         ephemeral: true
      });


   // "defer" the interaction
   else {
      // disable all components
      for (const actionRow of interaction.message.components)
         for (const component of actionRow.components)
            component.data.disabled = true;

      // edit the page button to show a loading state
      Object.assign(interaction.message.components[0].components[2].data, {
         label: null,
         emoji: Discord.parseEmoji(emojis.loading)
      });

      // update the interaction
      await interaction.update({
         components: interaction.message.components
      });
   };


   // get the blacklisted members
   let { members } = (await firestore.collection(`report-a-player`).doc(`blacklist`).get()).data();


   // split the members array into chunks of 50
   const size = 2;
   members = Array.from(
      new Array(Math.ceil(members.length / size)),
      (_element, i) => members.slice(i * size, i * size + size)
   );


   // get the page at this index
   const page = await Promise.all(
      members[+index]?.map(async id => `**${await userIsInGuild(id) ? Discord.userMention(id) : `@${(await interaction.client.users.fetch(id)).tag}`}**`)
         || []
   );


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setDescription(
            page.join(`\n`)
               || `${emojis.foxsleep} No users are listed on this page.`
         )
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`blacklist:${index - 1}`)
               .setEmoji(`⬅️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(index - 1 < 0),
            new Discord.ButtonBuilder()
               .setCustomId(`blacklist:${index + 1}`)
               .setEmoji(`➡️`)
               .setStyle(Discord.ButtonStyle.Primary)
               .setDisabled(index + 1 >= members.length),
            new Discord.ButtonBuilder()
               .setCustomId(`this button shows the pages, that's it`)
               .setLabel(`${+index + 1} / ${members.length || 1}`)
               .setStyle(Discord.ButtonStyle.Secondary)
               .setDisabled(true)
         ])
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      embeds,
      components
   });
};