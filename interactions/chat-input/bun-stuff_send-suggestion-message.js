import Discord from "discord.js";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * send the initial suggestions message
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // only magicalbunny31 🐾 can use this command
   const magicalbunny31 = await redis.GET(`flooded-area:user:magicalbunny31`);

   if (interaction.user.id !== magicalbunny31)
      return await interaction.reply({
         content: strip`
            hello member with administrator permissions
            please ignore this command
            kthx ${emojis.happ}
         `,
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setDescription(strip`
            **__Welcome to <#983394106950684704>!__**

            Submit any suggestions you have right here!
            Abusing suggestions will result in you being <@&979489114153963560>.

            When you submit a suggestion...
            > It will include your username and discriminator.
            > Others can vote on your suggestion.

            After submitting a suggestion...
            > The suggester and the <@&989125486590451732> are able to edit or delete (their own) suggestions.
            > Only the <@&989125486590451732> are able to approve/deny or lock a suggestion.
         `)
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.SelectMenuBuilder()
               .setCustomId(`suggestions`)
               .setPlaceholder(`Select a suggestion to submit...`)
               .setOptions([
                  new Discord.SelectMenuOptionBuilder()
                     .setLabel(`Game Suggestions`)
                     .setValue(`game-suggestions`)
                     .setDescription(`Suggest a new feature for Flooded Area on Roblox.`)
                     .setEmoji(`🎮`),
                  new Discord.SelectMenuOptionBuilder()
                     .setLabel(`Server Suggestions`)
                     .setValue(`server-suggestions`)
                     .setDescription(`Suggest an idea for this Discord server.`)
                     .setEmoji(`📂`),
                  new Discord.SelectMenuOptionBuilder()
                     .setLabel(`Part Suggestions`)
                     .setValue(`part-suggestions`)
                     .setDescription(`Suggest a new part for Flooded Area on Roblox.`)
                     .setEmoji(`🧱`),
                  new Discord.SelectMenuOptionBuilder()
                     .setLabel(`News Board Suggestions`)
                     .setValue(`news-board-suggestions`)
                     .setDescription(`Suggest text for the news board in Flooded Area on Roblox.`)
                     .setEmoji(`📰`)
               ])
         ]),
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`query-suggestions`)
               .setLabel(`How do I query suggestions?`)
               .setEmoji(emojis.flooded_area)
               .setStyle(Discord.ButtonStyle.Primary)
         ]),
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`popular-suggestions`)
               .setLabel(`Popular Suggestions`)
               .setEmoji(`🎉`)
               .setStyle(Discord.ButtonStyle.Secondary),
            new Discord.ButtonBuilder()
               .setCustomId(`trending-suggestions`)
               .setLabel(`Trending Suggestions`)
               .setEmoji(`📈`)
               .setStyle(Discord.ButtonStyle.Secondary)
         ])
   ];


   // send the message to the channel
   const channel = interaction.options.getChannel(`channel`);

   await channel.send({
      embeds,
      components
   });


   // edit the interaction
   return await interaction.editReply({
      content: `✅ **sent to ${channel}~**`
   });
};