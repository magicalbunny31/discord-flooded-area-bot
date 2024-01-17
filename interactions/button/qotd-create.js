export const name = "qotd-create";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];


import Discord from "discord.js";
import dayjs from "dayjs";
import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";

import cache from "../../data/cache.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, id ] = interaction.customId.split(`:`);


   // cache
   const data = cache.get(`qotd:${id}`);


   // set this data in the database
   const qotdDocRef = firestore.collection(`qotd`).doc(id);

   await qotdDocRef.set({
      ...data,
      approved: false,
      user:     interaction.user.id
   });


   // embeds
   const embeds = [
      ...interaction.message.embeds,

      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setDescription(strip`
            ### 📥 Your QoTD has been submitted
            > - A member of the ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} will review your QoTD before it gets posted to ${Discord.channelMention(process.env.FA_CHANNEL_QOTD)}.
            > - New ${Discord.channelMention(process.env.FA_CHANNEL_QOTD)}s are posted every day at ${Discord.time(dayjs().startOf(`day`).add(12, `hours`).toDate(), Discord.TimestampStyles.ShortTime)}.
         `)
   ];


   // update the interaction's original reply
   await interaction.update({
      embeds,
      components: []
   });
};