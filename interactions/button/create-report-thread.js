export const name = "create-report-thread";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import dayjs from "dayjs";
import { colours, emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button, type, hasWarnings ] = interaction.customId.split(`:`);


   // this report data has warnings, make sure they want to continue first
   if (hasWarnings === `true`) {
      interaction.message.embeds[1] = new Discord.EmbedBuilder(interaction.message.embeds[1].data)
         .setFields(
            interaction.message.embeds[1].fields.map(field =>
               ({
                  name: `‼️ ${field.name}`,
                  value: field.value
               })
            )
         );

      Object.assign(interaction.message.components[0].components[0].data, {
         custom_id: `create-report-thread:${type}:false`,
         label: `I understand the warnings: continue!`
      });

      return await interaction.update({
         embeds:     interaction.message.embeds,
         components: interaction.message.components
      });
   };


   const reportEmbed = new Discord.EmbedBuilder(interaction.message.embeds[0].data)
      .setTitle(`📣 Report a Player`)
      .setFields(
         [
            {
               name: `REPORT SUMMARY`,
               value: interaction.message.embeds[0].fields[0].value,
               inline: true
            }, {
               name: `THEIR ROBLOX ACCOUNT`,
               value: interaction.message.embeds[0].fields[1].value,
               inline: true
            }, {
               name: `PLAYER THEY'RE REPORTING`,
               value: interaction.message.embeds[0].fields[2].value,
               inline: true
            }
         ]
      )
      .setFooter({
         text: null
      });


   // update the interaction's reply
   await interaction.update({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setTitle(`📣 Report a Player`)
            .setDescription(`${emojis.loading} Creating report...`)
      ],
      components: []
   });


   // create the ticket thread
   const thread = await interaction.channel.threads.create({
      name: `📣┃unopened ticket`,
      type: Discord.ChannelType.PrivateThread,
      invitable: false
   });

   await thread.members.add(interaction.user);

   const reportMessage = await thread.send({
      embeds: [
         reportEmbed
      ]
   });


   // the prompt message, asking for evidence or debug info
   const promptMessage = await reportMessage.reply({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setTitle(`💻 Please send your debug info, too!`)
            .setDescription(strip`
               > - Take a screenshot of the information displayed: below is an example.
               > - This helps the ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} join your server, in case they need to.
               >  - Conversely, if you don't require a moderator to join your server, you can ignore this step.
               > - It can be found at \`Settings\` ➡️ \`Other\` ➡️ \`"Click to show debug info"\`.
            `)
            .setImage(`attachment://debug.png`),

         new Discord.EmbedBuilder()
            .setColor(reportEmbed.data.color)
            .setTitle(`📸 You'll now need to send proof.`)
            .setDescription(strip`
               > - You must send at least 1 image/video/link in this thread before you can submit your report.
               >  - Once you're ready, submit your report with the buttons below!
               >  - Changed your mind? You can also delete your report below, too.
               >  - If you don't submit your report ${Discord.time(dayjs(thread.createdAt).startOf(`hour`).add(1, `hour`).add(1, `day`).unix(), Discord.TimestampStyles.RelativeTime)}, this thread will be automatically deleted.
            `)
      ],
      components: [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(`submit-report:${type}:${interaction.user.id}:${reportMessage.id}`)
                  .setLabel(`Submit report`)
                  .setEmoji(`📬`)
                  .setStyle(Discord.ButtonStyle.Success),
               new Discord.ButtonBuilder()
                  .setCustomId(`close-ticket:${interaction.user.id}:0:true`) // 3rf arg: abandon (let the reporting player close and don't log ticket)
                  .setLabel(`Delete report`)
                  .setEmoji(`💣`)
                  .setStyle(Discord.ButtonStyle.Danger)
            )
      ],
      files: [
         new Discord.AttachmentBuilder()
            .setFile(`./assets/report-a-player/debug.png`)
            .setDescription(`The debug info, showing: server version, server location and server id.`)
      ]
   });


   // edit the interaction's original reply
   await interaction.editReply({
      embeds: [
         new Discord.EmbedBuilder()
            .setColor(colours.flooded_area)
            .setTitle(`#️⃣ Continue your report in the next channel.`)
            .setDescription(strip`
               > - Continue your report by moving to ${promptMessage.url}.
               >  - From there, you can send evidence or submit your report.
            `)
      ],
      components: [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setLabel(`Continue report`)
                  .setEmoji(`➡️`)
                  .setStyle(Discord.ButtonStyle.Link)
                  .setURL(promptMessage.url)
            )
      ]
   });
};