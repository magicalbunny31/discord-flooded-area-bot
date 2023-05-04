import Discord from "discord.js";
import { colours, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.AnySelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu ] = interaction.customId.split(`:`);
   const [ reason ] = interaction.values;


   // roles
   const { role } = (await firestore.collection(`role`).doc(`moderation-team`).get()).data();


   // reason descriptions
   const descriptions = {
      "false-votekicking": strip`
         > False votekicking is when someone gets votekicked for an unfair reason from a server.
         > The reason must clearly be against the rules, like "furry" or "weird".
      `,
      "griefing": strip`
         > Griefing is when someone intentionally destroys your build.
         > They must've been disassembled an entire build or made the game unplayable for others.
         > Minor griefing will lead to the player receiving a lighter punishment.
         > Griefing in the Part Playground is __not__ included in this rule.
      `,
      "spamming": strip`
         > Spamming is there are 3+ instances a player flooding the chat with nonsense.
         > Less severe cases will only lead to the player being warned.
      `,
      "bypassing": strip`
         > Bypassing is any form of manipulating the Roblox filter to say something inappropriate.
         > This includes players who build obscene structures.
         > __Some__ slurs are also considered swearing, rather than bigotry.
      `,
      "toxicity": strip`
         > Toxicity is when a player is constantly bullying or unironically bashing another player.
         > This includes players who also intentionally try to start arguments.
         > Regular trash talk, like "L" or "noob", is __not__ included in this rule.
      `,
      "bug-abuse": strip`
         > Bug abusing is when a player intentionally exploits an in-game bug to gain an unfair advantage over others.
         > The punishment depends on the type of bug abused.
         > Note that __not all bugs__ are included in this rule.
      `,
      "inappropriate-player": strip`
         > Players with an inappropriate display name or avatar will be told to change, or else moderation will be taken.
         > Furthermore, those with an inappropriate username will be permanently banned.
         > Creating accounts to impersonate staff members without permission will lead to a permanent ban.
         > Posting or building inappropriate content will lead to moderation.
      `,
      "bigotry": strip`
         > Bigotry is when a player is being intolerant of other player's opinions.
         > Examples of this include homophobia, racism, sexism, transphobia and more.
         > Staff will not take bigotry lightly: anything major will lead to a permanent ban.
      `,
      "exploiting": strip`
         > Exploiting or hacking is when a player uses a third-party program to gain an unfair advantage over others.
         > It doesn't matter if the exploit in question is harmless or not - it is not tolerated.
         > Any other players who intentionally associate with an exploiter will also be moderated.
         > Using exploits in private servers is __not__ included in this rule.
      `,
      "ban-evade": strip`
         > Ban evasion is when a player tries to circumvent a ban in-game through the use of alternate accounts.
         > Any clear alternate or troll accounts breaking the rules will be subject to a permanent ban.
      `,
      "other": strip`
         > Anything else you'd like to report?
         > Maybe you have an urgent query for the ${Discord.roleMention(role)}.
      `
   };


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(colours.flooded_area)
         .setTitle(`📣 Report a Player`)
         .setDescription(strip`
            💭 **What is this reason?**
            ${descriptions[reason]}
         `)
   ];


   // components
   const components = interaction.message.components;

   for (const option of components[0].components[0].options)
      option.default = false;

   const selectedOption = components[0].components[0].options.find(option => option.value === reason);
   selectedOption.default = true;

   components.splice(1, 1,
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`create-report:${interaction.id}:reporting-player:${reason}`)
               .setLabel(`Create Report`)
               .setEmoji(`🗒️`)
               .setStyle(Discord.ButtonStyle.Success)
         )
   );


   // update the interaction
   return await interaction.update({
      embeds,
      components
   });
};