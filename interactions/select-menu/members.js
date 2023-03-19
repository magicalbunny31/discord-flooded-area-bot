import Discord from "discord.js";
import { FieldValue } from "@google-cloud/firestore";

/**
 * @param {Discord.AnySelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu, type ] = interaction.customId.split(`:`);
   const members = interaction.values;


   // "defer" the interaction
   const components = interaction.message.components;

   const disabledComponents = components.map(actionRow =>
      actionRow.components.map(component => !component.disabled)
   );

   for (const [ actionRowIndex, disabledComponentsActionRow ] of disabledComponents.entries())
      for (const [ componentIndex, disabledComponent ] of disabledComponentsActionRow.entries())
         if (disabledComponent)
            components[actionRowIndex].components[componentIndex].data.disabled = true;

   await interaction.update({
      components
   });

   for (const [ actionRowIndex, disabledComponentsActionRow ] of disabledComponents.entries())
         for (const [ componentIndex, disabledComponent ] of disabledComponentsActionRow.entries())
            if (disabledComponent)
               components[actionRowIndex].components[componentIndex].data.disabled = false;


   // set these strings in the database
   if (type === `add`) { // add members
      try {
         await firestore.collection(`ticket-settings`).doc(interaction.user.id).update({
            members: FieldValue.arrayUnion(...members)
         });

      } catch {
         await firestore.collection(`ticket-settings`).doc(interaction.user.id).set({
            members
         });
      };


   } else // remove members
      await firestore.collection(`ticket-settings`).doc(interaction.user.id).update({
         members: FieldValue.arrayRemove(...members)
      });


   // edit select menus based on the users muted
   const { members: newMembers } = (await firestore.collection(`ticket-settings`).doc(interaction.user.id).get()).data();

   components[1].components[0].data.disabled = newMembers.length === 25;

   components[2].components[0] = new Discord.StringSelectMenuBuilder()
      .setCustomId(`members:remove`)
      .setPlaceholder(`🔔 Select members to unmute...`)
      .setOptions(
         newMembers.length
            ? await Promise.all(
               newMembers
                  .map(async userId => {
                     const user = await interaction.client.users.fetch(userId);
                     const member = await interaction.guild.members.fetch(user);
                     return new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`${member.displayName}`)
                        .setDescription(`@${user.tag} (${userId})`)
                        .setValue(userId);
                  })
            )
            : new Discord.StringSelectMenuOptionBuilder() // fallback option if no options are present
               .setLabel(`🦊`)
               .setValue(`🦊`)
      )
      .setMinValues(1)
      .setMaxValues(newMembers.length || 1)
      .setDisabled(!newMembers.length);


   // edit the interaction's original reply
   return await interaction.editReply({
      components
   });
};