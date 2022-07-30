import Discord from "discord.js";

import pkg from "../../package.json" assert { type: "json" };

import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * modify a player's ban from roblox flooded area
 * @param {Discord.ButtonInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // button info
   const [ _button, playerId ] = interaction.customId.split(`:`);


   // get this banned user
   const bannedUser = await (async () => {
      const response = await fetch(`${process.env.BAN_DATABASE_URL}/${playerId}`, {
         headers: {
            "Accept": `application/json`,
            "User-Agent": `${pkg.name} (https://github.com/magicalbunny31/discord-flooded-area-bot)`
         }
      });

      if (response.ok)
         return await response.json();

      else
         return {
            ok: false,
            status: response.status
         };
   })();


   // response isn't okai
   if (bannedUser?.ok === false) {
      // disable the modify ban button
      interaction.message.components[0].components[
         interaction.message.components[0].components.length === 2
            ? 1 : 0
      ].data.disabled = true;

      // update the interaction
      return await interaction.update({
         embeds: [
            new Discord.EmbedBuilder()
               .setColor(colours.flooded_area)
               .setDescription(strip`
                  ❌ **can't get this ban entry**
                  > ${
                     bannedUser.status === 404
                        ? `the id \`${playerId}\` wasn't found in the ban list chief` // not found
                        : `some scary error occurred with the ban list! try again later maybe`
                  }
               `)
         ],
         components: interaction.message.components
      });
   };


   // modal fields
   const reason = bannedUser.fields.Reason?.stringValue || ``;
   const banDuration = `wip`; // TODO ask enrise about how temporary bans work


   // show modal
   return await interaction.showModal(
      new Discord.ModalBuilder()
         .setCustomId(`mod_modify-ban:${playerId}`)
         .setTitle(`modify ban`)
         .setComponents([
            new Discord.ActionRowBuilder()
               .setComponents([
                  new Discord.TextInputBuilder()
                     .setCustomId(`reason`)
                     .setLabel(`REASON`)
                     .setPlaceholder(`📝 why are they being banned? this'll be shown to the banned user too`)
                     .setValue(reason)
                     .setRequired(true)
                     .setStyle(Discord.TextInputStyle.Short)
                     .setMaxLength(50)
               ]),

            new Discord.ActionRowBuilder()
               .setComponents([
                  new Discord.TextInputBuilder()
                     .setCustomId(`ban-duration`)
                     .setLabel(`BAN DURATION`)
                     .setPlaceholder(`⌚ how long will this ban last?`)
                     .setValue(banDuration)
                     .setRequired(false)
                     .setStyle(Discord.TextInputStyle.Short)
               ])
         ])
   );
};