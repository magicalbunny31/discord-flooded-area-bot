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
   if ([
      `votekick`, `kick`,                                               // false votekicking
      `grief`, `greif`, `grif`,                                         // griefing
      `spam`, `message`, `chat`,                                        // spamming
      `bypass`, `swear`, `swore`, `word`,                               // bypassing / swearing
      `toxic`, `harass`, `annoy`,                                       // toxicity / harassment
      `bug`, `part fling`,                                              // _bug abuse              <== so vscode aaron-bond.better-comments would shut up
      `inappropriate`, `disgust`,                                       // inappropriate player
      `bigot`, `intolerant`, `homophob`, `racis`, `sexis`, `transphob`, // bigotry
      `exploit`, `hack`, `fly`, `clip`, `fast`, `speed`,                // exploiting / hacking
      `evade`, `votekicked`                                             // ban evading
   ].some(word => reason.includes(word))) {
      interaction.message.embeds[1].data.color = colours.red;
      interaction.message.embeds[1].data.fields.splice(1, 1, {
         name: `💭 There may already be a category for your reason!`,
         value: strip`
            > Is this \`${
               (() => {
                  switch (true) {
                     case [ `votekick`, `kick` ]                                              .some(word => reason.includes(word)): return `False votekicking`;
                     case [ `grief`, `greif`, `grif` ]                                        .some(word => reason.includes(word)): return `Griefing`;
                     case [ `spam`, `message`, `chat` ]                                       .some(word => reason.includes(word)): return `Spamming`;
                     case [ `bypass`, `swear`, `swore`, `word` ]                              .some(word => reason.includes(word)): return `Bypassing / Swearing`;
                     case [ `toxic`, `harass`, `annoy` ]                                      .some(word => reason.includes(word)): return `Toxicity / Harassment`;
                     case [ `bug`, `part fling` ]                                             .some(word => reason.includes(word)): return `Bug abuse`;
                     case [ `inappropriate`, `disgust` ]                                      .some(word => reason.includes(word)): return `Inappropriate player`;
                     case [ `bigot`, `intolerant`, `homophob`, `racis`, `sexis`, `transphob` ].some(word => reason.includes(word)): return `Bigotry`;
                     case [ `exploit`, `hack`, `fly`, `clip`, `fast`, `speed` ]               .some(word => reason.includes(word)): return `Exploiting / Hacking`;
                     case [ `evade`, `votekicked` ]                                           .some(word => reason.includes(word)): return `Ban evading`;
                  };
               })()
            }\`?
            > If so, go back and report for that reason!
            > If not, you're still able to continue this report.
         `
      });
      components[0].components.splice(2, 1,
         new Discord.ButtonBuilder()
            .setCustomId(`report-a-player:true`)
            .setLabel(`Return to menu`)
            .setEmoji(`📣`)
            .setStyle(Discord.ButtonStyle.Danger)
      );

   } else {
      interaction.message.embeds[1].data.color = interaction.user.accentColor || (await interaction.user.fetch()).accentColor || interaction.member.displayColor;
      interaction.message.embeds[1].data.fields.splice(1, 1);
      components[0].components.splice(2, 1);
   };


   // embeds
   interaction.message.embeds[1].data.fields[0].value = `>>> ${reason ? Discord.escapeMarkdown(reason) : emojis.loading}`;


   // components
   components[0].components[0].data.custom_id = `prompt-other-reason:${id}:${valueId}`;
   components[0].components[1].data.custom_id = `create-report:${id}:confirm-input:${valueId}`;
   components[0].components[1].data.disabled = !reason;


   // edit the interaction's original reply
   return await interaction.editReply({
      embeds: interaction.message.embeds,
      components
   });
};