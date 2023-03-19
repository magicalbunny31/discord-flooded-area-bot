import Discord from "discord.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, id, reason, value ] = interaction.customId.split(`:`);


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`reported-player:${id}:${reason}`)
      .setTitle(`👥 ${
         {
            "false-votekicking":    `Who votekicked you?`,
            "griefing":             `Who griefed you?`,
            "spamming":             `Who is spamming?`,
            "bypassing":            `Who bypassed / swore?`,
            "toxicity":             `Who is being toxic / harassing others?`,
            "bug-abuse":            `Who is abusing bugs?`,
            "inappropriate-player": `Who is being inappropriate?`,
            "bigotry":              `Who is being mean?`,
            "exploiting":           `Who is exploiting / hacking?`,
            "ban-evade":            `Who is ban evading?`,
            "other":                `Who are you reporting?`
         }[reason]
      }`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`reported-player`)
                  .setLabel(`PLAYER`)
                  .setPlaceholder(`📝 Input their username...`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMinLength(3)
                  .setMaxLength(20)
                  .setRequired(true)
            )
      );

   if (value)
      modal.components[0].components[0].setValue(value);


   // show the modal
   return await interaction.showModal(modal);
};