import Discord from "discord.js";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * send the initial reaction roles message
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
            <@&1002622412258545684>
            > Lets you be notified when someone is looking for a group to play with in the game!
            > Anyone can ping this role in <#988108886022193193>.

            <@&1002622717364797521>
            > You'll be notified for occasional events staff members and developers hold.

            <@&1002622851708366920>
            > Get pinged whenever there's a poll.

            <@&1002624005292953631>
            > This role will get pinged whenever there's a new update or sneak peak for the game.

            <@&1002624300039286804>
            > Be notified for giveaways that may include huge sums of in-game coins or just cool roles for the server.

            <@&1002623502358159440>
            > Be the first to see challenges we hold (every week or so).

            <@&1002623021619609630>
            > This is a role for <@330380239735750658> to ping whenever he's doing something he'd like people to see.
         `)
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents([
            new Discord.ButtonBuilder()
               .setCustomId(`select-roles`)
               .setLabel(`Select Roles`)
               .setEmoji(`📝`)
               .setStyle(Discord.ButtonStyle.Primary)
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