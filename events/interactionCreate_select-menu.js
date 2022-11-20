export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";
import { emojis } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Interaction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // function to try to fetch something or return undefined instead of throwing
   const tryOrUndefined = async promise => {
      try {
         return await promise;
      } catch {
         return undefined;
      };
   };


   // this file is for AnySelectMenuInteractions
   if (!interaction.isAnySelectMenu())
      return;


   // select menu info
   const [ selectMenu ] = interaction.customId.split(`:`);


   // the start of this select menu is probably an id
   if (+selectMenu)
      return;


   // get this select menu's file
   const file = await tryOrUndefined(import(`../interactions/select-menu/${selectMenu}.js`));


   // this file doesn't exist
   if (!file)
      return await interaction.reply({
         content: `${emojis.rip} **\`this select menu doesn't work - sorry!\`**`,
         ephemeral: true
      });


   try {
      // run the select menu for this file
      return await file.default(interaction, firestore);


   } catch (error) {
      // an error occurred
      return await sendBotError(
         interaction,
         {
            url: process.env.WEBHOOK_ERRORS
         },
         error
      );
   };
};