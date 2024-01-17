export const name = "qotd-edit";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import dayjs from "dayjs";
import { emoji, strip } from "@magicalbunny31/awesome-utility-stuff";

import cache from "../../data/cache.js";
import qotd from "../../data/qotd.js";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // modal info
   const [ _modal, id, type ] = interaction.customId.split(`:`);


   // update the cache based on the type
   switch (type) {


      case `content`: {
         // fields
         const description = interaction.fields.getTextInputValue(`description`).trim();
         const imageUrl    = interaction.fields.getTextInputValue(`image`)      .trim();

         // this imageUrl is a discord url
         if (imageUrl && new URL(imageUrl).hostname === `media.discordapp.net`)
            return await interaction.reply({
               content: strip`
                  ### ❌ Discord URLs are not allowed for images
                  > - You can't use images hosted on Discord because of ${Discord.hyperlink(`this announcement from Discord`, `https://discord.com/channels/613425648685547541/697138785317814292/1157372186160537750`)}.
                  > - Use a file upload site like ${Discord.hyperlink(`Catbox`, Discord.hideLinkEmbed(`https://catbox.moe`))} or ${Discord.hyperlink(`Imgur`, Discord.hideLinkEmbed(`https://imgur.com/upload`))} to host this image.
               `,
               ephemeral: true
            });

         // cache
         cache.set(`qotd:${id}`, {
            ...(cache.get(`qotd:${id}`) || {}),
            description,
            imageUrl
         }, dayjs.duration(1, `day`).asSeconds());

         // stop here
         break;
      };


      case `thread`: {
         // fields
         const threadName = interaction.fields.getTextInputValue(`name`).trim();

         // cache
         cache.set(`qotd:${id}`, {
            ...(cache.get(`qotd:${id}`) || {}),
            threadName
         }, dayjs.duration(1, `day`).asSeconds());

         // stop here
         break;
      };


      case `reactions`: {
         // fields
         const reactionEmoji = interaction.fields.getTextInputValue(`emoji`).trim();
         const reactionName  = interaction.fields.getTextInputValue(`name`) .trim();

         // this isn't an emoji
         if (!reactionEmoji.match(emoji))
            return await interaction.reply({
               content: `### ❌ "${Discord.escapeMarkdown(reactionEmoji)}" isn't a valid emoji`,
               ephemeral: true
            });

         // get current reaction choices
         const reactionChoices = cache.get(`qotd:${id}`)?.reactionChoices || [];

         // a reaction choice with this emoji/name already exists
         if (reactionChoices.find(reactionChoice => reactionChoice.reactionEmoji === reactionEmoji || reactionChoice.reactionName === reactionName))
            reactionChoices.splice(reactionChoices.findIndex(reactionChoice => reactionChoice.reactionEmoji === reactionEmoji || reactionChoice.reactionName === reactionName), 1);

         // add to the reaction choices
         reactionChoices.push({
            reactionEmoji,
            reactionName
         });

         // set the data back into the cache
         cache.set(`qotd:${id}`, {
            ...(cache.get(`qotd:${id}`) || {}),
            reactionChoices
         }, dayjs.duration(1, `day`).asSeconds());

         // stop here
         break;
      };


   };


   // respond to the interaction
   await qotd(interaction, id);
};