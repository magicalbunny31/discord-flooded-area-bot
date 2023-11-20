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
   switch (true) {


      case value === `false-votekicking`: {
         embeds[0]
            .setDescription(strip`
               ### ❓ False votekicking is...
               > - Starting a votekick for an invalid (being a furry) or false (griefing when you weren't actually griefing) reason.
               >  - You must have evidence to prove that you weren't doing what you were votekicked for if it's not clearly against the rules.
               > - Starting a votekick for something that happened in another server.
               > - Using multiple accounts to help votekicks pass.

               ### ✨ Final things
               > - It'll help us if you provide a screenshot of the votekick modal for us to take action - we don't have in-game logs.
               > - By submitting this report, you confirm that it is truthful and made in good faith. Do not submit false or duplicate reports.
            `);

         break;
      };


      case value === `griefing`: {
         embeds[0]
            .setDescription(strip`
               ### ❓ Griefing is...
               > - When someone purposefully breaks your boat through ungluing, bombs or any other destructive means.

               ### ❌ You cannot report someone for griefing
               > - Griefing is allowed in-game! Use votekicks to remove them from the server.
            `);

         break;
      };


      case [ `harassed-people`, `threatened-people`, `hate-speech`, `violence`, `swore-in-chat`, `sexual-in-chat` ].includes(value): {
         embeds[0]
            .setDescription(strip`
               ### ✨ Final things!
               > - You'll have to show us the chat that you're reporting - we don't have in-game logs.
               > - By submitting this report, you confirm that it is truthful and made in good faith. Do not submit false or duplicate reports.
            `);

         break;
      };


      case value === `inappropriate-avatar`: {
         embeds[0]
            .setDescription(strip`
               ### ✨ Final things!
               > - You'll have to show us the player's avatar that you're reporting - whether that's with a screenshot or a link to their profile.
               > - By submitting this report, you confirm that it is truthful and made in good faith. Do not submit false or duplicate reports.
            `);

         break;
      };


      case value === `exploiting`: {
         embeds[0]
            .setDescription(strip`
               ### ✨ Final things!
               > - You'll have to show us a video of the player that's using exploits.
               > - By submitting this report, you confirm that it is truthful and made in good faith. Do not submit false or duplicate reports.
            `);

         break;
      };


      case value === `bug-abuse`: {
         embeds[0]
            .setDescription(strip`
               ### ❓ Abusing bugs is...
               > - Doing something that wasn't intended in-game to gain an unfair advantage over others.

               ### ✅ Examples of bugs which aren't allowed in-game and can be reported
               > - Infinite fly glitches
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


      case value === `sexual-build`: {
         embeds[0]
            .setDescription(strip`
               ### ✨ Final things!
               > - You'll have to show us the build, as well as some form of proof that they were the one who built it.
               > - By submitting this report, you confirm that it is truthful and made in good faith. Do not submit false or duplicate reports.
            `);

         break;
      };


      case value === `being-sexual`: {
         embeds[0]
            .setDescription(strip`
               ### ✨ Final things!
               > - You'll have to show us how the player is being sexual.
               > - By submitting this report, you confirm that it is truthful and made in good faith. Do not submit false or duplicate reports.
            `);

         break;
      };


      case value === `ban-evasion`: {
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


      case value === `moderator-abuse`: {
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


      case value === `other`: {
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


      default: {
         embeds[0]
            .setDescription(strip`
               ### ${emojis.bun_paw_wave} ${choice([ `Hello`, `Hi`, `Welcome` ])}, ${interaction.user}!
               > - If you find anyone who is breaking our ${Discord.channelMention(process.env.FA_CHANNEL_RULES_AND_INFO)} in ${Discord.hyperlink(`Flooded Area`, `https://www.roblox.com/games/3976767347/Flooded-Area`)}, you can report them to us here.
               > - You can also ${Discord.hyperlink(`report players to Roblox`, `https://en.help.roblox.com/hc/en-us/articles/203312410-How-to-Report-Rule-Violations`)} too, if you think it's necessary.
               > - Remember that you can always ${Discord.hyperlink(`block`, `https://en.help.roblox.com/hc/en-us/articles/203314270-How-to-Block-Another-User`)} or ${Discord.hyperlink(`mute`, `https://alvarotrigo.com/blog/mute-someone-roblox`)} any players that you don't want to interact with in chat.
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
   switch (value) {


      // during a round
      case `during-round`: {
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`report-a-player:1`)
                     .setPlaceholder(`What happened during the round?`)
                     .setOptions(
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Started an invalid votekick`)
                           .setEmoji(`🥾`)
                           .setValue(`false-votekicking`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Griefed me or someone else`)
                           .setEmoji(`💣`)
                           .setValue(`griefing`)
                     )
               )
         );

         break;
      };


      // chat
      case `chat`: {
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`report-a-player:1`)
                     .setPlaceholder(`What did this player do in chat?`)
                     .setOptions(
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Verbally harassed me or someone else`)
                           .setEmoji(`💢`)
                           .setValue(`harassed-people`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Threatened violence or real world harm`)
                           .setEmoji(`💢`)
                           .setValue(`threatened-people`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Promoted hate based on identity or vulnerability`)
                           .setEmoji(`💢`)
                           .setValue(`hate-speech`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Celebrated or glorified acts of violence`)
                           .setEmoji(`💢`)
                           .setValue(`violence`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Used offensive language`)
                           .setEmoji(`🗯️`)
                           .setValue(`swore-in-chat`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Said something explicit or sexual`)
                           .setEmoji(`🗯️`)
                           .setValue(`sexual-in-chat`)
                     )
               )
         );

         break;
      };


      // player
      case `player`: {
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`report-a-player:1`)
                     .setPlaceholder(`Why is this player being reported?`)
                     .setOptions(
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Inappropriate avatar`)
                           .setEmoji(`🔞`)
                           .setValue(`inappropriate-avatar`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Using exploits, cheats, or hacks`)
                           .setEmoji(`💻`)
                           .setValue(`exploiting`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Abusing a bug or glitch to gain an unfair advantage`)
                           .setEmoji(`🐛`)
                           .setValue(`bug-abuse`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Built something explicit or sexual`)
                           .setEmoji(`🔞`)
                           .setValue(`sexual-build`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Being suggestive or sexual in-game`)
                           .setEmoji(`🔞`)
                           .setValue(`being-sexual`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Evading a ban with an alternate account`)
                           .setEmoji(`👥`)
                           .setValue(`ban-evasion`)
                     )
               )
         );

         break;
      };


      // something else
      case `something-else`: {
         components.splice(1, 4,
            new Discord.ActionRowBuilder()
               .setComponents(
                  new Discord.StringSelectMenuBuilder()
                     .setCustomId(`report-a-player:1`)
                     .setPlaceholder(`How can the Moderation Team help you?`)
                     .setOptions(
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Moderator abusing their powers`)
                           .setEmoji(`🚨`)
                           .setValue(`moderator-abuse`),
                        new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`Another reason...`)
                           .setEmoji(`❓`)
                           .setValue(`other`)
                     )
               )
         );

         break;
      };


      // an end option was set, show the button
      default: {
         const canMakeReport = ![ `griefing` ].includes(value);

         components.splice(2, 3,
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

         break;
      };


   };


   // update the interaction
   await interaction.update({
      embeds,
      components
   });
};