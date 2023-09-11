export const name = "create-report";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";

import cache from "../../data/cache.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, type, id ] = interaction.customId.split(`:`);


   // what to show for the modal
   const fields = {
      "false-votekicking": [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`reason`)
                  .setLabel(`WHY YOU WERE VOTEKICKED`)
                  .setPlaceholder(`What was the reason of the votekick?`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMaxLength(200)
                  .setRequired(false)
            )
      ],
      "griefing":  [],
      "spamming":  [],
      "bypassing": [],
      "toxicity":  [],
      "bug-abuse": [],
      "inappropriate-player": [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`reason`)
                  .setLabel(`HOW THEY WERE BEING INAPPROPRIATE`)
                  .setPlaceholder(`What were they doing that was inappropriate?`)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setMaxLength(1000)
                  .setRequired(true)
            )
      ],
      "bigotry":    [],
      "exploiting": [],
      "ban-evade":  [],
      "mod-abuse": [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`reason`)
                  .setLabel(`HOW THEY WERE ABUSING THEIR POWERS`)
                  .setPlaceholder(`How was this moderator abusing their powers?`)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setMaxLength(1000)
                  .setRequired(true)
            )
      ],
      "other": [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`reason`)
                  .setLabel(`WHY THEY'RE BEING REPORTED`)
                  .setPlaceholder(`Why are you reporting this player?`)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setMaxLength(1000)
                  .setRequired(true)
            )
      ]
   };


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`create-report:${type}`)
      .setTitle(`📣 Report a Player`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`reporting-player`)
                  .setLabel(`YOUR ROBLOX ACCOUNT`)
                  .setPlaceholder(`What's your Roblox username?`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMinLength(3)
                  .setMaxLength(20)
                  .setRequired(false)
            ),
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`reported-player`)
                  .setLabel(`PLAYER YOU'RE REPORTING`)
                  .setPlaceholder(`What's the player you're reporting's Roblox username?`)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMinLength(3)
                  .setMaxLength(20)
                  .setRequired(true)
            ),
         ...fields[type]
      );


   // input the user's roblox username, if it's not filled in already (and this isn't an edit)
   if (!modal.components[0].components[0].data.value && cache.get(`bloxlink-linked-account`)?.[interaction.user.id] && !id)
      modal.components[0].components[0].setValue(cache.get(`bloxlink-linked-account`)[interaction.user.id].name);


   // the current fields for editing a report
   if (id) {
      const data = cache.get(id);

      if (data.reportingPlayerUsername?.length >= 3)
         modal.components[0].components[0].setValue(data.reportingPlayerUsername);

      if (data.reportedPlayerUsername?.length >= 3)
         modal.components[1].components[0].setValue(data.reportedPlayerUsername);

      if (modal.components[2] && data.reason)
         modal.components[2].components[0].setValue(data.reason);
   };


   // show the modal
   await interaction.showModal(modal);
};