import Discord from "discord.js";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal submit info
   const [ _modal, id, reason ] = interaction.customId.split(`:`);


   // fields
   const username = interaction.fields.getTextInputValue(`reported-player`).trim();
   const isValidUsername = /^(?=^[^_]+_?[^_]+$)\w{3,20}$/.test(username);


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

   // user-agent string for requests
   const userAgent = `discord-area-communities-bot (https://github.com/magicalbunny31/discord-area-communities-bot)`;


   // get this player
   const reportedPlayer = await (async () => {
      const response = await fetch(`https://users.roblox.com/v1/usernames/users`, {
         method: `POST`,
         headers: {
            "Accept": `application/json`,
            "Content-Type": `application/json`,
            "User-Agent": userAgent
         },
         body: JSON.stringify({
            usernames: [ username ]
         })
      });

      if (!response.ok)
         return null;

      const { data } = await response.json();

      if (data?.[0]?.name.toLowerCase() !== username.toLowerCase())
         return null;

      return data[0];
   })();


   // embeds
   interaction.message.embeds[1].data.color = reportedPlayer ? interaction.user.accentColor || (await interaction.user.fetch()).accentColor || interaction.member.displayColor : colours.red;

   interaction.message.embeds[1].data.fields[0].value = reportedPlayer
      ? `> ${Discord.hyperlink(`${reportedPlayer.displayName} (@${reportedPlayer.name})`, `https://www.roblox.com/users/${reportedPlayer.id}/profile`)}`
      : `> ${username || emojis.loading}`;

   interaction.message.embeds[1].data.fields.splice(1, 1,
      ...!isValidUsername
         ? [{
            name: `❌ Invalid username`,
            value: strip`
               > You must input a valid username.
            `
         }]
         : !reportedPlayer
            ? [{
               name: `💭 A player with this username does not exist`,
               value: strip`
                  > You'll need to input a valid username to continue.
                  > Is it not important? You can still continue anyway!
               `
            }]
            : []
   );


   // components
   components[0].components[0].data.custom_id = `prompt-reported-player:${id}:${reason}:${username}`;
   components[0].components[1].data.custom_id = `create-report:${id}:confirm-reported-player:${reportedPlayer?.id}`;
   components[0].components[1].data.disabled = !isValidUsername || !reportedPlayer;


   // edit the interaction's original reply
   return await interaction.editReply({
      embeds: interaction.message.embeds,
      components
   });
};