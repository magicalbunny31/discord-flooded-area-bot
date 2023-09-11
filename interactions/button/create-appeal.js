export const name = "create-appeal";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";

import cache from "../../data/cache.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, id ] = interaction.customId.split(`:`);


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`create-appeal`)
      .setTitle(`🔨 Ban Appeals`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`banned-player`)
                  .setLabel(`YOUR ROBLOX ACCOUNT`)
                  .setPlaceholder(`What's your Roblox username?`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMinLength(3)
                  .setMaxLength(20)
                  .setRequired(true)
            ),
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`ban-reason`)
                  .setLabel(`WHY YOU WERE BANNED`)
                  .setPlaceholder(`Not sure? Feel free to leave this blank.`)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setMaxLength(1000)
                  .setRequired(false)
            ),
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`why-reconsider`)
                  .setLabel(`WHY YOU BELIEVE WE SHOULD RECONSIDER IT`)
                  .setPlaceholder(`Help us understand why you didn't break the rules and have been banned in error.`)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setMaxLength(1000)
                  .setRequired(true)
            )
      );


   // input the user's roblox username, if it's not filled in already (and this isn't an edit)
   if (!modal.components[0].components[0].data.value && cache.get(`bloxlink-linked-account`)?.[interaction.user.id] && !id)
      modal.components[0].components[0].setValue(cache.get(`bloxlink-linked-account`)[interaction.user.id].name);


   // the current fields for editing a report
   if (id) {
      const data = cache.get(id);

      if (data.bannedPlayerUsername?.length >= 3)
         modal.components[0].components[0].setValue(data.bannedPlayerUsername);

      if (data.banReason)
         modal.components[1].components[0].setValue(data.banReason);

      if (data.whyReconsider)
         modal.components[2].components[0].setValue(data.whyReconsider);
   };


   // show the modal
   await interaction.showModal(modal);
};