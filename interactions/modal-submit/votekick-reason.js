import Discord from "discord.js";
import dayjs from "dayjs";

import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";
import { Timestamp } from "@google-cloud/firestore";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal submit info
   const [ _modal, id ] = interaction.customId.split(`:`);


   // fields
   const reason = interaction.fields.getTextInputValue(`reason`).trim();


   // "defer" the interaction
   const components = interaction.message.components;

   for (const actionRow of components)
      for (const component of actionRow.components)
         component.data.disabled = true;

   await interaction.update({
      components
   });

   for (const actionRow of components)
      for (const component of actionRow.components)
         component.data.disabled = false;


   // value id
   const valueId = interaction.id;
   await firestore.collection(`temporary-stuff`).doc(valueId).set({
      value: reason,
      delete: new Timestamp(dayjs().add(1, `day`).unix(), 0)
   });


   // keyword found
   if ([ `grief`, `greif`, `grif`, `trol`, `false`, `steal`, `broke`, `unglu`, `ruin`, `annoy`, `flung`, `fling`, `mean`, `spam` ].some(word => reason.includes(word))) {
      interaction.message.embeds[1].data.color = colours.red;
      interaction.message.embeds[1].data.fields.splice(1, 1, {
         name: `🗯️ We may not be able to do anything about your report`,
         value: strip`
            > The ${Discord.roleMention(process.env.ROLE_MODERATION_TEAM)} will not be able to get enough evidence to prove that you were *not* doing what you were votekicked for.
            > They don't have chat logs either, so do not rely on that!
            > Examples of votekick reasons for this are "griefing", "exploiting".
            > If you constantly create invalid reports for these votekick reasons, you may be blocked from ${Discord.channelMention(process.env.CHANNEL_REPORT_A_PLAYER)}.
         `
      });

   } else {
      interaction.message.embeds[1].data.color = interaction.user.accentColor || (await interaction.user.fetch()).accentColor || interaction.member.displayColor;
      interaction.message.embeds[1].data.fields.splice(1, 1);
   };


   // embeds
   interaction.message.embeds[1].data.fields[0].value = `> ${reason ? Discord.escapeMarkdown(reason) : emojis.loading}`;


   // components
   components[0].components[0].data.custom_id = `prompt-votekick-reason:${id}:${valueId}`;
   components[0].components[1].data.custom_id = `create-report:${id}:confirm-input:${valueId}`;
   components[0].components[1].data.disabled = !reason;


   // edit the interaction's original reply
   return await interaction.editReply({
      embeds: interaction.message.embeds,
      components
   });
};