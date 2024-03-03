export const name = "update-roblosecurity-cookie";
export const guilds = [ process.env.GUILD_DARKNESS_OBBY ];

import Discord from "discord.js";
import Noblox from "noblox.js";
import crypto from "crypto";
import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal info
   const [ _modal ] = interaction.customId.split(`:`);


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // fields
   const roblosecurityCookie = interaction.fields.getTextInputValue(`roblosecurity-cookie`).trim();


   // validate that this cookie is correct
   const expectedUserId = 5631124345;

   const cookieIsValid = await (async () => {
      try {
         const loggedInUser = await Noblox.setCookie(roblosecurityCookie);
         return loggedInUser.UserID === expectedUserId;
      } catch (error) {
         return false;
      };
   })();

   if (!cookieIsValid)
      return await interaction.editReply({
         content: strip`
            ### ${emojis.no} looks like this \`.ROBLOSECURITY\` cookie is invalid..
            > - make sure you've copied the whole string (including the warning at the start) and that you've removed any \`"\`s within it too
            > - the \`.ROBLOSECURITY\` cookie should correspond to ${Discord.hyperlink(`@UniverseLabMLoader`, `https://www.roblox.com/users/${expectedUserId}/profile`)}'s account - not anyone else's!
         `
      });


   // encrypt the cookie and update it in the database
   const cipher = crypto.createCipheriv(`aes-256-cbc`, Buffer.from(process.env.ROBLOSECURITY_KEY, `hex`), Buffer.from(process.env.ROBLOSECURITY_IV, `hex`));
   const encryptedCookie = Buffer.concat([ cipher.update(roblosecurityCookie), cipher.final() ]);

   await firestore.collection(`bot-model-submission`).doc(process.env.GUILD_DARKNESS_OBBY).update({
      ROBLOSECURITY: encryptedCookie
   });


   // edit the deferred interaction
   await interaction.editReply({
      content: `### ${emojis.yes} updated \`.ROBLOSECURITY\` cookie!`
   });
};