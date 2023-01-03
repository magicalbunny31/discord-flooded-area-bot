import Discord from "discord.js";
import { emojis } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal submit info
   const [ _modal, subcommand, option, showInList ] = interaction.customId.split(`:`);


   // fields
   const id            = interaction.fields.getTextInputValue(`id`)            .trim();
   const formattedName = interaction.fields.getTextInputValue(`formatted name`).trim();

   const flavourText = interaction.fields
      .fields
      .find(field => field.customId === `flavour text`)
      ?.value
      .trim();

   const description = interaction.fields
      .fields
      .find(field => field.customId === `description`)
      ?.value
      .trim();

   const craftingRecipe = interaction.fields
      .fields
      .find(field => field.customId === `crafting recipe`)
      ?.value
      .trim()
      .split(`\n`)
      .filter(Boolean)
      .map(line => {
         const [ quantity, ...part ] = line.split(` `);
         return { quantity: +quantity, part: part.join(` `) };
      });

   const creators = interaction.fields
      .fields
      .find(field => field.customId === `creators`)
      ?.value
      .trim()
      .split(`\n`)
      .filter(Boolean)
      .map(line => {
         const [ robloxUsername, robloxId, discordId ] = line.split(` `);
         return { "roblox-username": robloxUsername, "roblox-id": +robloxId, ...discordId ? { "discord-id": discordId } : {} };
      });

   const modifiers = interaction.fields
      .fields
      .find(field => field.customId === `modifiers`)
      ?.value
      .trim()
      .split(`\n`);


   // defer the interaction
   await interaction.deferReply();


   // the payload for this part/map
   const payload = {
      [id]: {
         "name": formattedName,

         ...subcommand === `part`
            ? {
               "flavour-text":    flavourText,
               "description":     description,
               "crafting-recipe": craftingRecipe,
               "obtained-through": [
                  `finding it out in the open`,
                  `crafting or part packs`,
                  `admin commands`
               ][option],
               "show-in-list": !!+showInList
            }

            : {
               "creators":  creators,
               "modifiers": modifiers,
               "game-mode": [
                  `survival`,
                  `escape`,
                  `two-team elimination`,
                  `four-team elimination`,
                  `free-for-all`,
                  `boat`,
                  `free money`
               ][option],
               "show-in-list": !!+showInList,
               "removed": false /* change this value manually in the database */
            }
      }
   };


   // add to the database
   await firestore.collection(`command`).doc(`get-${subcommand}-info`).update(payload);


   // edit the deferred interaction
   return await interaction.editReply({
      content: `✅ **added to the ${emojis.flooded_area} ${Discord.chatInputApplicationCommandMention(`get-${subcommand}-info`, interaction.client.application.id)} database~**`
         + `\n>>> ${
            Discord.codeBlock(`json`,
               JSON.stringify(payload, null, 3)
            )
         }`
   });
};