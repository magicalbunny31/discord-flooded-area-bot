export const name = "suggest-new-bot-feature";
export const guilds = [ process.env.GUILD_UNIVERSE_LABORATORIES ];

import Discord from "discord.js";
import { colours } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal info
   const [ _modal ] = interaction.customId.split(`:`);


   // fields
   const feature = interaction.fields.getTextInputValue(`feature`).trim();


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // send a webhook
   await new Discord.WebhookClient({
      url: process.env.WEBHOOK_SPACED_OUT_FEATURE_REQUESTS
   })
      .send({
         content: `<@490178047325110282>`,
         embeds: [
            new Discord.EmbedBuilder()
               .setColor(colours.spaced_out)
               .setAuthor({
                  name: `@${interaction.user.username}`,
                  iconURL: interaction.user.displayAvatarURL()
               })
               .setDescription(feature)
         ],
         threadId: `1132520901494194227`
      });


   // edit the deferred interaction
   await interaction.editReply({
      content: `### ✅ Feature request sent!`
   });
};