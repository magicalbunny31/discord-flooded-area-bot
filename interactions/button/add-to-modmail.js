export const name = "add-to-modmail";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, to, modmailId, modmailSender, replyId ] = interaction.customId.split(`:`);


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`add-to-modmail:${to}:${modmailId}:${modmailSender}:${replyId}`)
      .setTitle(`📬 Sending Modmail Message`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`content`)
                  .setLabel(`MODMAIL CONTENT`)
                  .setPlaceholder(
                     to === `to-mod`
                        ? `What would you like to send to the Head of Moderation?`
                        : `What would you like to send to this person?`
                  )
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setMaxLength(4000)
                  .setRequired(true)
            )
      );


   // show the modal
   await interaction.showModal(modal);
};