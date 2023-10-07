export const name = "america";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`america`)
   .setDescription(`OH SAY CAN YOU SEEEEEEEEEEE`);


import Discord from "discord.js";
import { FieldValue } from "@google-cloud/firestore";
import { emojis, autoArray, choice, sum } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // this wasn't run in the america thread
   const americaThreadId = `1160224987853115433`;

   if (interaction.channel.id !== americaThreadId)
      return await interaction.reply({
         content: `### ➡️ ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(`america`, interaction.commandId)} can only be used in ${Discord.channelMention(americaThreadId)}`,
         ephemeral: true
      });


   // defer the interaction
   await interaction.deferReply();


   // emojis
   const flagUs = `🇺🇸`;
   const flagGb = `🇬🇧`;

   const flippedAmerica = `<:flipped_america:1116431279185993899>`;
   const americanFlag   = `<:american_flag:1061290300343066645>`;
   const prideFlag      = `<:pride_flag:1113838962084155442>`;


   // data of america
   const americaData = [{
      key: `america`,
      content: `america`,
      emoji: choice([ flagUs, flagUs, americanFlag, americanFlag, prideFlag ]),
      chance: 86 / 100
   }, {
      key: `flood`,
      content: `there's no ${Discord.chatInputApplicationCommandMention(`america`, interaction.commandId)} - the area is flooding!!`,
      emoji: `🌊`,
      chance: 5 / 100
   }, {
      key: `space`,
      content: `\`°·̩.● .☆  a m e r i c a  °★ .:·̩*\``,
      emoji: `🛰️`,
      chance: 5 / 100
   }, {
      key: `furry`,
      content: `amerwica!~ nyaa~~`,
      emoji: emojis.happ,
      chance: 4 / 100
   }, {
      key: `flipped`,
      content: `ɐɔᴉɹǝɯɐ`,
      emoji: flippedAmerica,
      chance: 0.9 / 100
   }, {
      key: `rare`,
      content: `super rare ${Discord.chatInputApplicationCommandMention(`america`, interaction.commandId)}™️!`,
      emoji: `✨`,
      chance: 0.09 / 100
   }, {
      key: `rarer`,
      content: `*even* more rarer ${Discord.chatInputApplicationCommandMention(`america`, interaction.commandId)}™️™️!!`,
      emoji: `🌟`,
      chance: 0.009 / 100
   }, {
      key: `british`,
      content: `bri'ish mate, innit?`,
      emoji: flagGb,
      chance: 0.001 / 100
   }];

   // 50% chance of getting the furry response when if the user has the @bunny was here role
   const isClosetFurry = interaction.member.roles.cache.has(process.env.FA_ROLE_BUNNY_WAS_HERE);

   // edit the furry entry's chances to equal the sum of all america entry chances (simulating 50% of the chances)
   if (isClosetFurry)
      americaData
         .find(data => data.key === `furry`)
         .chance
         = sum(
            americaData
               .filter(data => data.key !== `furry`)
               .map(data => data.chance)
         );

   // find the smallest chance of the americaData
   const smallestChance = Math.min(...americaData.map(data => data.chance));

   // get the number of decimal places in this chance (this is to multiple by this many zeros for autoArray)
   const numberOfDecimals = `${smallestChance}`.split(`.`)[1].length;
   const multiplyByThis = Math.pow(10, numberOfDecimals);

   // america to display
   const america = choice(
      americaData.flatMap(data =>
         autoArray(Math.floor(data.chance * multiplyByThis), () => data)
      )
   );


   // get the value of the counter
   const americaDocRef  = firestore.collection(`america`).doc(interaction.guild.id);
   const americaDocSnap = await americaDocRef.get();
   const americaDocData = americaDocSnap.data() || {};

   const timesUsedGlobal = (americaDocData[america.key] || 0) + 1;


   // edit the interaction's original reply
   await interaction.editReply({
      content: `${america.content} ${america.emoji} (\`${timesUsedGlobal.toLocaleString()}\`)`
   });


   // update the counter
   if (americaDocSnap.exists)
      await americaDocRef.update({
         [america.key]: FieldValue.increment(1)
      });

   else
      await americaDocRef.set({
         [america.key]: FieldValue.increment(1)
      });
};