export const name = "bot-model-submission";
export const guilds = [ process.env.GUILD_UNIVERSE_LABORATORIES ];

import Discord from "discord.js";
import Noblox from "noblox.js";
import dayjs from "dayjs";
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
   const model = interaction.fields.getTextInputValue(`model`).trim();


   // get this model's asset id
   const isUrl = (() => {
      try {
         return !!new URL(model);
      } catch {
         return false;
      };
   })();

   const isAssetId = !isNaN(+model);

   const assetId = isUrl
      ? new URL(model).pathname.split(`/`).find(path => +path)
      : +model;

   if (!isUrl && !isAssetId)
      return await interaction.editReply({
         content: strip`
            ### ${emojis.no} unknown asset
            > - ${interaction.client.user} couldn't parse your input
            > - the following inputs are valid:
            >  - a url to your model (\`https://create.roblox.com/store/asset/3102037587/Gentle-Egg\`)
            >  - your model's asset id (\`3102037587\`)
         `
      });


   // check if this model exists
   const modelExists = await (async () => {
      // send a HTTP GET request to the api
      const response = await fetch(`https://apis.roblox.com/assets/v1/assets/${assetId}`, {
         headers: {
            "accept":    `application/json`,
            "x-api-key": process.env.ROBLOX_OPEN_CLOUD_UNIVERSE_LABORATORIES_API_KEY
         }
      });

      // response not ok
      if (!response.ok)
         return false;

      // if this is a model or not
      const data = await response.json();
      return data?.assetType === `Model`;
   })();

   if (!modelExists)
      return await interaction.editReply({
         content: strip`
            ### ${emojis.no} invalid asset
            > - ${interaction.client.user} couldn't get your asset
            > - did you copy your model's url/asset id correctly?
            > - are you sure this asset is a model?
         `
      });


   // get the ROBLOSECURITY cookie
   // ..storing the encrypted cookie on the firestore might not be the best idea..? idk, but we're both happy with it i think so whatever
   const botModelSubmissionDocRef  = firestore.collection(`bot-model-submission`).doc(process.env.GUILD_UNIVERSE_LABORATORIES);
   const botModelSubmissionDocSnap = await botModelSubmissionDocRef.get();
   const botModelSubmissionDocData = botModelSubmissionDocSnap.data();

   const encryptedCookie = botModelSubmissionDocData.ROBLOSECURITY;

   const decipher = crypto.createDecipheriv(`aes-256-cbc`, Buffer.from(process.env.ROBLOSECURITY_KEY, `hex`), Buffer.from(process.env.ROBLOSECURITY_IV, `hex`));
   const decryptedCookie = Buffer.concat([ decipher.update(Buffer.from(encryptedCookie, `hex`)), decipher.final() ]);

   const roblosecurityCookie = decryptedCookie.toString();


   // validate that this cookie is correct
   const expectedUserId = 5631124345;

   const cookieIsValid = await (async () => {
      try {
         const loggedInUser = await Noblox.setCookie(roblosecurityCookie);
         return loggedInUser.UserID === expectedUserId;
      } catch (error) {
         return error;
      };
   })();

   if (cookieIsValid instanceof Error)
      return await interaction.editReply({
         content: strip`
            ### ${emojis.no} ${interaction.client.user} couldn't submit your model..
            > - ..but don't worry - it's not your fault!
            > - send the attached file to ${Discord.userMention(process.env.USER_WELOLOLOL)} to help troubleshoot this error:
         `,
         files: [
            new Discord.AttachmentBuilder()
               .setName(`error.txt`)
               .setFile(
                  Buffer.from(strip`
                     📂 bot-model-submission
                     ⌚ ${dayjs().utc().format(`DD/MMM/YYYY HH:mm:ss`).toLowerCase()} UTC±0000 (${dayjs().unix()})

                     ## 🐾🦊🐰💤✨ ##

                     ⚠️ the provided .ROBLOSECURITY cookie was invalid for account @UniverseLabMLoader (https://www.roblox.com/users/${expectedUserId}/profile)
                     📥 to update it, log into the account and grab the cookie, then use /update-roblosecurity-cookie and follow the instructions from there~

                     ## 🐾🦊🐰💤✨ ##

                     📄 ERROR LOG : noblox.js

                     ${
                        cookieIsValid.message
                           .split(`\n`)
                           .map(content => `💬 ${content}`)
                           .join(`\n`)
                     }
                  `)
               )
         ]
      });


   // buy the asset
   const [ magicalbunny31 ] = JSON.parse(process.env.DEVELOPERS.replaceAll(`'`, `"`));

   const boughtAsset = await (async () => {
      try {
         await Noblox.buy(assetId);
         return true;
      } catch (error) {
         return error;
      }
   })();

   if (boughtAsset instanceof Error) {
      // model not for sale
      if (boughtAsset.message === `This item is not for sale.`)
         return await interaction.editReply({
            content: strip`
               ### ${emojis.no} your model must be for sale to submit it
               > - enable the "Distribute on Creator Store" setting for your model (using the link below) then try again
               >  - https://create.roblox.com/dashboard/creations/store/${assetId}/configure
            `
         });

      // model already owned
      else if (boughtAsset.message === `You already own this item.`)
         return await interaction.editReply({
            content: strip`
               ### ${emojis.no} you've already submitted this model
               > - no need to resubmit it - go try it out now!
            `
         });

      // other error
      else
         return await interaction.editReply({
            content: strip`
               ### ${emojis.no} ${interaction.client.user} couldn't submit your model..
               > - ..but don't worry - it's not your fault!
               > - send the attached file to ${Discord.userMention(magicalbunny31)} to help troubleshoot this error:
            `,
            files: [
               new Discord.AttachmentBuilder()
                  .setName(`error.txt`)
                  .setFile(
                     Buffer.from(strip`
                        📂 bot-model-submission
                        ⌚ ${dayjs().utc().format(`DD/MMM/YYYY HH:mm:ss`).toLowerCase()} UTC±0000 (${dayjs().unix()})

                        ## 🐾🦊🐰💤✨ ##

                        📄 ERROR LOG : noblox.js

                        ${
                           boughtAsset.message
                              .split(`\n`)
                              .map(content => `💬 ${content}`)
                              .join(`\n`)
                        }
                     `)
                  )
            ]
         });
   };


   // edit the deferred interaction
   await interaction.editReply({
      content: strip`
         ### ${emojis.yes} model submitted!
         > - the model you have submitted is: https://create.roblox.com/store/asset/${assetId}
      `
   });
};