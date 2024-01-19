export const name = "report-a-player";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import { emojis, choice, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.StringSelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu ] = interaction.customId.split(`:`);
   const [ value ] = interaction.values;


   // embeds
   const embeds = interaction.message.embeds
      .map(embed => new Discord.EmbedBuilder(embed.data));


   // change embeds
   switch (value) {


      case `false-votekicking`: {
         embeds[0]
            .setDescription(strip`
               ### ❓ False votekicking is...
               > - Starting a votekick for an invalid (being a furry) or false (griefing when you weren't actually griefing) reason.
               >  - You must have evidence to prove that you weren't doing what you were votekicked for if it's not clearly against the rules.
               > - Starting a votekick for something that happened in another server.
               > - Using multiple accounts to help votekicks pass.

               ### ✨ Final things!
               > - It'll help us if you provide a screenshot of the votekick modal for us to take action - we don't have in-game logs.
               > - By submitting this report, you confirm that it is truthful and made in good faith. Do not submit false or duplicate reports.
            `);

         break;
      };


      case `griefing`: {
         embeds[0]
            .setDescription(strip`
               ### ❓ Griefing is...
               > - When someone purposefully breaks your boat through ungluing, bombs or any other destructive means.

               ### ❌ You cannot report someone for griefing
               > - Griefing is allowed in-game! Use votekicks to remove them from the server.
            `);

         break;
      };


      case `bypassing`:
      case `toxicity`:
      case `bigotry`: {
         embeds[0]
            .setDescription(strip`
               ### ✨ Final things!
               > - You'll have to show us the chat that you're reporting - we don't have in-game logs.
               > - By submitting this report, you confirm that it is truthful and made in good faith. Do not submit false or duplicate reports.
            `);

         break;
      };


      case `inappropriate`: {
         embeds[0]
            .setDescription(strip`
               ### ✨ Final things!
               > - You'll have to show us how this player is being inappropriate.
               >  - For avatars, it can be a screenshot (preferred, as they may change their avatar in the meantime) or a link to their avatar.
               >  - For builds, show us the build as well as some form of proof that they were the one who built it.
               > - You'll have to show us the player's avatar that you're reporting - whether that's with a screenshot or a link to their profile.
               > - By submitting this report, you confirm that it is truthful and made in good faith. Do not submit false or duplicate reports.
            `);

         break;
      };


      case `exploiting`: {
         embeds[0]
            .setDescription(strip`
               ### 📢 If this player is still exploiting and in a server, consider mod calling instead
               > - The ${Discord.roleMention(process.env.FA_ROLE_MODERATION_TEAM)} may not be able to respond to this report immediately.
               > - Else, record this player using their exploits and create a report.

               ### ✨ Final things!
               > - You'll have to show us a video of the player that's using exploits.
               > - By submitting this report, you confirm that it is truthful and made in good faith. Do not submit false or duplicate reports.
            `);

         break;
      };


      case `bug-abuse`: {
         embeds[0]
            .setDescription(strip`
               ### ❓ Abusing bugs is...
               > - Doing something that wasn't intended in-game to gain an unfair advantage over others.

               ### ✅ Examples of bugs which aren't allowed in-game and can be reported
               > - Infinite health/fly glitches
               > - Rope flinging

               ### ❌ Examples of bugs which are allowed in-game and can't be reported
               > - Prop flinging
               > - Tab glitching
               > - Other harmless bugs

               ### ✨ Final things!
               > - You'll have to show us a video of the player that's abusing the bug or glitch.
               >  - All reports are judged on a case-by-case basis: don't be surprised if we don't take action on the reported player.
               > - By submitting this report, you confirm that it is truthful and made in good faith. Do not submit false or duplicate reports.
            `);

         break;
      };


      case `ban-evasion`: {
         embeds[0]
            .setDescription(strip`
               ### ❓ Ban evasion is...
               > - Using another account to play ${Discord.hyperlink(`Flooded Area`, `https://www.roblox.com/games/3976767347/Flooded-Area`)} when you're already banned on another account.
               > - Using another account to join a server that another account you own was votekicked on.

               ### ✨ Final things!
               > - You'll have to show us how you found out this player is evading a ban.
               >  - It'd also help if you found out what their main account was, too.
               > - By submitting this report, you confirm that it is truthful and made in good faith. Do not submit false or duplicate reports.
            `);

         break;
      };


      case `moderator-abuse`: {
         embeds[0]
            .setDescription(strip`
               ### ❓ Moderator abuse is...
               > - When a moderator uses their powers to make the game unenjoyable for others.
               >  - We have rules that all mods should follow - they are not above those rules.

               ### ✨ Final things!
               > - You'll have to show us how this moderator was abusing their powers.
               > - By submitting this report, you confirm that it is truthful and made in good faith. Do not submit false or duplicate reports.
            `);

         break;
      };


      case `other`: {
         embeds[0]
            .setDescription(strip`
               ### ❓ Something else you'd like to report?
               > - That's completely fine! Just fill out the form to the best of your ability.
               > - We're open to questions if you're unsure about any details - we won't bite!

               ### ✨ Final things!
               > - You'll have to show us some form of proof to help us with your report.
               > - By submitting this report, you confirm that it is truthful and made in good faith. Do not submit false or duplicate reports.
            `);

         break;
      };


   };


   // components
   const components = interaction.message.components;

   const foundActionRowIndex = components.findIndex(component => component.components.some(component => component.customId === interaction.customId));
   const foundComponentIndex = components[foundActionRowIndex].components.findIndex(component => component.customId === interaction.customId);

   const options = components[foundActionRowIndex].components[foundComponentIndex].data.options;
   for (const option of options)
      if (value === option.value)
         option.default = true;
      else
         option.default = false;


   // change select menus
   const canMakeReport = ![ `griefing` ].includes(value);

   components.splice(1, 4,
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`create-report:${value}`)
               .setLabel(`Create report`)
               .setEmoji(`🗒️`)
               .setStyle(Discord.ButtonStyle.Success)
               .setDisabled(!canMakeReport)
         )
   );


   // update the interaction
   await interaction.update({
      embeds,
      components
   });
};