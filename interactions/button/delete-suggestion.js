import Discord from "discord.js";

/**
 * delete suggestion and thread
 * @param {Discord.ButtonInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // button info
   const [ _button, id ] = interaction.customId.split(`:`);


   // update the interaction
   await interaction.update({
      components: [
         new Discord.ActionRowBuilder()
            .setComponents([
               new Discord.ButtonBuilder()
                  .setCustomId(`delete-suggestion:${id}`)
                  .setLabel(`Deleting...`)
                  .setEmoji(`💥`)
                  .setStyle(Discord.ButtonStyle.Danger)
                  .setDisabled(true)
            ])
      ]
   });


   // what type of suggestion this suggestion is exactly
   const channelTypes = Object.fromEntries(Object.entries(await redis.HGETALL(`flooded-area:channel:suggestions`)).map(id => id.reverse()));
   const type = channelTypes[interaction.channel.parent.id];


   // get the suggestion
   const suggestionMessage = await interaction.channel.fetchStarterMessage();


   // change the suggestion's deleted status
   await redis
      .multi()
      .HSET(`flooded-area:${type}:${suggestionMessage.id}`, {
         "last-updated-timestamp": JSON.stringify(interaction.createdTimestamp),
         "deleted": JSON.stringify(true)
      })
      .HDEL(`flooded-area:${type}:${suggestionMessage.id}`, `message-url`)
      .exec();


   // delete the suggestion
   await suggestionMessage.delete();


   // delete this thread (safe)
   if (interaction.channel.isThread())
      await interaction.channel.delete();
};