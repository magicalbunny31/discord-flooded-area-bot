export const name = "update-roblosecurity-cookie";
export const guilds = [ process.env.GUILD_DARKNESS_OBBY ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`update-roblosecurity-cookie`)
   .setDescription(`Update the ROBLOSECURITY cookie that's used in requests`)
   .setDefaultMemberPermissions(Discord.PermissionFlagsBits.Administrator);


import Discord from "discord.js";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`update-roblosecurity-cookie`)
      .setTitle(`update ROBLOSECURITY cookie`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`roblosecurity-cookie`)
                  .setLabel(`ROBLOSECURITY COOKIE`)
                  .setPlaceholder(`input the ROBLOSECURITY cookie here..`)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setRequired(true)
            )
      );


   // show the modal
   await interaction.showModal(modal);
};