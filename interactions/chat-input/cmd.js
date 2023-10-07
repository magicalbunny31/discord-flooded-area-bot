export const name = "cmd";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];

export const data = new Discord.SlashCommandBuilder()
   .setName(`cmd`)
   .setDescription(`Run a command`)
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`command`)
         .setDescription(`Command to run, use "help" for a list of commands`)
         .setMaxLength(512)
         .setRequired(true)
   );


import Discord from "discord.js";
import dayjs from "dayjs";
import fs from "fs/promises";
import { FieldValue, Timestamp } from "@google-cloud/firestore";
import { colours, emojis, choice, number, strip, sum } from "@magicalbunny31/awesome-utility-stuff";

import pkg from "../../package.json" assert { type: "json" };

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const command = interaction.options.getString(`command`);


   // data to show
   const data = {
      [process.env.GUILD_FLOODED_AREA]: {
         colour: colours.flooded_area
      },

      [process.env.GUILD_SPACED_OUT]: {
         colour: colours.spaced_out
      }
   }[interaction.guild.id];


   // user-agent for http requests
   const userAgent = `${pkg.name}/${pkg.version} (https://nuzzles.dev/area-communities-bot)`;


   // this command
   const [ commandName ] = command.toLowerCase().split(/ +/);

   const args = command
      .slice(command.toLowerCase().indexOf(commandName) + commandName.length)
      .trim()
      .match(/[^\s"']+|"([^"]*)"|'([^']*)'/gm)
      ?.map(string =>
         string.startsWith(`"`) && string.endsWith(`"`)
            ? string.slice(1, -1)
            : string
      )
      || [];


   // function to format a command response
   const toCommand = content => {
      const formattedCommand = [
         commandName,
         command
            .slice(command.toLowerCase().indexOf(commandName) + commandName.length)
            .trim()
      ]
         .filter(Boolean)
         .join(` `)
         .toLowerCase();

      return [
         `### ${interaction.user}: \`$ ${formattedCommand}\``,
         content
            ?.split(`\n`)
            .map(line => `> ${line.trim()}`)
            .join(`\n`)
      ]
         .filter(Boolean)
         .join(`\n`);
   };


   // command contains automodded content (and i moderatable by the bot)
   const autoModerationRules = await interaction.guild.autoModerationRules.fetch();
   const keywordAutoModerationRules = autoModerationRules.filter(autoModerationRule => autoModerationRule.triggerType === Discord.AutoModerationRuleTriggerType.Keyword);

   const keywords = keywordAutoModerationRules
      .map(autoModerationRule => autoModerationRule.triggerMetadata.keywordFilter)
      .flat();

   const regexes = keywordAutoModerationRules
      .map(autoModerationRule => autoModerationRule.triggerMetadata.regexPatterns)
      .flat();

   const contentAutomodded = (
      keywords.some(keyword =>
         keyword.startsWith(`*`) && keyword.endsWith(`*`)
            ? new RegExp(`\b\w*${keyword.slice(1, -1)}\w*\b`, `gm`).test(command.toLowerCase())
            : keyword.startsWith(`*`)
               ? new RegExp(`\b${keyword.slice(1)}\w*`, `gm`).test(command.toLowerCase())
               : keyword.endsWith(`*`)
                  ? new RegExp(`\w*${keyword.slice(0, -1)}\b`, `gm`).test(command.toLowerCase())
                  : command.toLowerCase().includes(keyword)
      )
      ||
      regexes.some(regex =>
         new RegExp(regex, `gi`).test(command.toLowerCase())
      )
   );

   if (contentAutomodded && interaction.member.moderatable) {
      // reply to the interaction
      await interaction.reply({
         content: toCommand(`${emojis.AutoMod} ${Discord.hyperlink(`Your command contains content which is blocked by this server.`, `https://support.discord.com/hc/en-us/articles/4421269296535-AutoMod-FAQ`)}`),
         flags: [
            Discord.MessageFlags.SuppressEmbeds
         ],
         allowedMentions: {
            parse: []
         },
         ephemeral: true
      });

      // send to automod logs and time out user, if this is flooded area
      if (interaction.guild.id === process.env.GUILD_FLOODED_AREA) {
         await interaction.member.timeout(60 * 1000);

         const channel = await interaction.guild.channels.fetch(process.env.FA_CHANNEL_AUTOMOD_LOGS);
         await channel.send({
            content: `${emojis.AutoMod} ${interaction.client.user} has blocked a command in ${interaction.channel}`,
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(Discord.Colors.Blurple)
                  .setAuthor({
                     iconURL: interaction.user.displayAvatarURL(),
                     name: interaction.user.discriminator === `0`
                        ? `@${interaction.user.username}`
                        : `@${interaction.user.username}#${interaction.user.discriminator}`
                  })
                  .setDescription(`${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(interaction.commandName, interaction.commandId)} ${command}`)
            ]
         });
      };

      // stop here
      return;
   };


   // run command
   switch (commandName) {


      // 617
      case `617`: {
         const sixSeventeenThisYear = dayjs.utc().startOf(`year`)               .add(6, `months`).add(16, `days`).add(12, `hours`).unix();
         const sixSeventeenNextYear = dayjs.utc().startOf(`year`).add(1, `year`).add(6, `months`).add(16, `days`).add(12, `hours`).unix();

         const sixSeventeen = sixSeventeenThisYear > dayjs.utc().unix()
            ? sixSeventeenThisYear
            : sixSeventeenNextYear;

         return await interaction.reply({
            content: toCommand(`<:617:1119576849752793129> the next 6/17 is ${Discord.time(sixSeventeen, Discord.TimestampStyles.RelativeTime)}`),
            allowedMentions: {
               parse: []
            }
         });
      };


      // 8ball
      case `8ball`: {
         await interaction.reply({
            content: toCommand(emojis.loading),
            allowedMentions: {
               parse: []
            }
         });

         const response = await fetch(`https://eightballapi.com/api`, {
            headers: {
               "Accept": `application/json`,
               "User-Agent": userAgent
            }
         });

         if (!response.ok)
            return await interaction.editReply({
               content: toCommand(`ERR: the 8ball broke`),
               allowedMentions: {
                  parse: []
               }
            });

         const { reading } = await response.json();
         return await interaction.editReply({
            content: toCommand(`🎱 "${reading}"`),
            allowedMentions: {
               parse: []
            }
         });
      };


      // america
      case `america`: {
         await interaction.reply({
            content: toCommand(emojis.loading),
            allowedMentions: {
               parse: []
            }
         });

         return await interaction.editReply({
            content: toCommand(
               [
                  strip`
                     O say can you see, by the dawn's early light,
                     What so proudly we hail'd at the twilight's last gleaming,
                     Whose broad stripes and bright stars through the perilous fight
                     O'er the ramparts we watch'd were so gallantly streaming?
                     And the rocket's red glare, the bombs bursting in air,
                     Gave proof through the night that our flag was still there,
                     O say does that star-spangled banner yet wave
                     O'er the land of the free and the home of the brave?
                  `,
                  ``,
                  strip`
                     On the shore dimly seen through the mists of the deep
                     Where the foe's haughty host in dread silence reposes,
                     What is that which the breeze, o'er the towering steep,
                     As it fitfully blows, half conceals, half discloses?
                     Now it catches the gleam of the morning's first beam,
                     In full glory reflected now shines in the stream,
                     'Tis the star-spangled banner - O long may it wave
                     O'er the land of the free and the home of the brave!
                  `,
                  ``,
                  strip`
                     And where is that band who so vauntingly swore,
                     That the havoc of war and the battle's confusion
                     A home and a Country should leave us no more?
                     Their blood has wash'd out their foul footstep's pollution.
                     No refuge could save the hireling and slave
                     From the terror of flight or the gloom of the grave,
                     And the star-spangled banner in triumph doth wave
                     O'er the land of the free and the home of the brave.
                  `,
                  ``,
                  strip`
                     O thus be it ever when freemen shall stand
                     Between their lov'd home and the war's desolation!
                     Blest with vict'ry and peace may the heav'n rescued land
                     Praise the power that hath made and preserv'd us a nation!
                     Then conquer we must, when our cause it is just,
                     And this be our motto - “In God is our trust,”
                     And the star-spangled banner in triumph shall wave
                     O'er the land of the free and the home of the brave.
                  `
               ]
                  .join(`\n`)
            ),
            files: [
               new Discord.AttachmentBuilder()
                  .setFile(`./assets/america/Star_Spangled_Banner_instrumental.ogg`)
            ],
            allowedMentions: {
               parse: []
            }
         });
      };


      // bird/birb/scotty
      case `bird`:
      case `birb`:
      case `scotty`:
      // cat/car/meow/nya
      case `cat`:
      case `car`:
      case `meow`:
      case `nya`:
      // dog/woof
      case `dog`:
      case `woof`:
      // duck/quack
      case `duck`:
      case `quack`:
      // otter/ot/squeak
      case `otter`:
      case `ot`:
      case `ott`:
      case `squeak`:
      // rabbit/bunny/bun/bunbun
      case `rabbit`:
      case `bunny`:
      case `bun`:
      case `bunbun`:
      // red-panda/wah
      case `red-panda`:
      case `wah`:
      // wolf/awoo
      case `wolf`:
      case `awoo`: {
         await interaction.reply({
            content: toCommand(emojis.loading),
            allowedMentions: {
               parse: []
            }
         });

         const endpoints = {
            bird:        [ `bird`, `birb`, `scotty`           ],
            cat:         [ `cat`, `car`, `meow`, `nya`        ],
            dog:         [ `dog`, `woof`                      ],
            duck:        [ `duck`, `quack`                    ],
            otter:       [ `otter`, `ot`, `ott`, `squeak`     ],
            rabbit:      [ `rabbit`, `bunny`, `bun`, `bunbun` ],
            "red-panda": [ `red-panda`, `wah`                 ],
            wolf:        [ `wolf`, `awoo`                     ]
         };
         const endpoint = Object.entries(endpoints).find(data => data[1].includes(commandName))[0];

         const response = await fetch(`https://api.chewey-bot.top/${endpoint}`, {
            headers: {
               "Accept": `application/json`,
               "Authorization": process.env.CHEWEY_BOT_API_KEY,
               "User-Agent": userAgent
            }
         });

         if (!response.ok)
            return await interaction.editReply({
               content: toCommand(`ERR: couldn't fetch ${endpoint}`),
               allowedMentions: {
                  parse: []
               }
            });

         const { data } = await response.json();
         return await interaction.editReply({
            content: toCommand(),
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.ButtonBuilder()
                        .setLabel(`Chewey Bot API`)
                        .setEmoji(`🌐`)
                        .setStyle(Discord.ButtonStyle.Link)
                        .setURL(`https://api.chewey-bot.top`)
                  )
            ],
            files: [
               new Discord.AttachmentBuilder()
                  .setFile(data)
            ],
            allowedMentions: {
               parse: []
            }
         });
      };


      // ball/balls/baller
      case `ball`:
      case `balls`:
      case `baller`: {
         await interaction.reply({
            content: toCommand(emojis.loading),
            allowedMentions: {
               parse: []
            }
         });

         const images = await fs.readdir(`./assets/ball`);
         const file   = choice(images);
         const image  = `./assets/ball/${file}`;

         return await interaction.editReply({
            content: toCommand(),
            files: [
               new Discord.AttachmentBuilder()
                  .setFile(image)
                  .setDescription(`ball`)
            ],
            allowedMentions: {
               parse: []
            }
         });
      };


      // boop haiii
      case `boop`: {
         if (args[0]?.toLowerCase() !== `haiii`)
            break;

         return await interaction.reply({
            content: toCommand(`boop haiii`),
            allowedMentions: {
               parse: []
            }
         });
      };


      // button
      case `button`: {
         await interaction.reply({
            content: toCommand(emojis.loading),
            allowedMentions: {
               parse: []
            }
         });

         const buttonDocRef  = firestore.collection(`button`).doc(interaction.guild.id);
         const buttonDocSnap = await buttonDocRef.get();
         const buttonDocData = buttonDocSnap.data() || {};

         const lastBoop = Math.max(...Object.values(buttonDocData).map(timestamp => timestamp.seconds));
         const lastBoopedBy = Object.entries(buttonDocData).find(data => data[1].seconds === lastBoop)?.[0];

         await buttonDocRef.update({
            [interaction.user.id]: new Timestamp(dayjs().unix(), 0)
         });

         return await interaction.editReply({
            content: toCommand(strip`
               You boop the button, resetting its timer of \`${dayjs.duration((dayjs().unix() - lastBoop) * 1000).format(`D[d], H[h], m[m], s[s]`)}\` in this server.
               ${
                  lastBoopedBy
                     ? `It was last booped at ${Discord.time(lastBoop)} by ${Discord.userMention(lastBoopedBy)}.`
                     : ``
               }
            `),
            allowedMentions: {
               parse: []
            }
         });
      };


      // choice/choose
      case `choice`:
      case `choose`: {
         if (!args.length)
            return await interaction.reply({
               content: toCommand(`ERR: nothing to choose`),
               allowedMentions: {
                  parse: []
               },
               ephemeral: true
            });

         return await interaction.reply({
            content: toCommand(
               choice(args)
            ),
            allowedMentions: {
               parse: []
            }
         });
      };


      // discord
      case `discord`: {
         return await interaction.reply({
            content: toCommand(strip`
               https://discord.com/invite/flooded-area-community-977254354589462618
               https://discord.com/invite/kEhWGX6gK6
            `),
            allowedMentions: {
               parse: []
            }
         });
      };


      // flip/coin
      case `flip`:
      case `coin`: {
         return await interaction.reply({
            content: toCommand(`🪙 ${choice([ `heads`, `tails` ])}`),
            allowedMentions: {
               parse: []
            }
         });
      };


      // fox/fop/foxxo/foxie/foxes/fops/foxxos/foxies/yip
      case `fox`:
      case `fop`:
      case `foxxo`:
      case `foxie`:
      case `foxes`:
      case `fops`:
      case `foxxos`:
      case `foxies`:
      case `yip`: {
         await interaction.reply({
            content: toCommand(emojis.loading),
            allowedMentions: {
               parse: []
            }
         });

         const response = await fetch(`https://randomfox.ca/floof`, {
            headers: {
               "Accept": `application/json`,
               "User-Agent": userAgent
            }
         });

         if (!response.ok)
            return await interaction.editReply({
               content: toCommand(`ERR: couldn't fetch fox`),
               allowedMentions: {
                  parse: []
               }
            });

         const { image, link } = await response.json();
         return await interaction.editReply({
            content: toCommand(),
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.ButtonBuilder()
                        .setLabel(`RandomFox`)
                        .setEmoji(`🌐`)
                        .setStyle(Discord.ButtonStyle.Link)
                        .setURL(link)
                  )
            ],
            files: [
               new Discord.AttachmentBuilder()
                  .setFile(image)
            ],
            allowedMentions: {
               parse: []
            }
         });
      };


      // game/games
      case `game`:
      case `games`: {
         return await interaction.reply({
            content: toCommand(strip`
               https://www.roblox.com/games/3976767347/Flooded-Area
               https://www.roblox.com/games/13672239919/Spaced-Out
            `),
            allowedMentions: {
               parse: []
            }
         });
      };


      // help/commands
      case `help`:
      case `commands`: {
         return await interaction.reply({
            content: toCommand(),
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(data.colour)
                  .setTitle(`📋 Commands for ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(interaction.commandName, interaction.commandId)}`)
                  .setDescription(strip`
                     - \`617\`
                     - \`8ball\`
                     - \`america\`
                     - \`ball\`/\`balls\`/\`baller\`
                     - \`bird\`/\`birb\`/\`scotty\`
                     - \`boop haiii\`
                     - \`button\`
                     - \`cat\`/\`car\`/\`meow\`/\`nya\`
                     - \`choice\`/\`choose\`
                     - \`discord\`
                     - \`dog\`/\`woof\`
                     - \`duck\`/\`quack\`
                     - \`flip\`/\`coin\`
                     - \`fox\`/\`fop\`/\`foxxo\`/\`foxie\`/\`foxes\`/\`fops\`/\`foxxos\`/\`foxies\`/\`yip\`
                     - \`game\`/\`games\`
                     - \`help\`/\`commands\`
                     - \`hi\`/\`hai\`/\`hello\`/\`hewwo\`/\`howdy\`/\`meowdy\`/\`hey\`/\`hoi\`
                     - \`otter\`/\`ot\`/\`squeak\`
                     - \`pancake\`/\`pancakes\`
                     - \`pet\`
                     - \`rabbit\`/\`bunny\`/\`bun\`/\`bunbun\`
                     - \`rate\`
                     - \`roll\`/\`dice\`
                     - \`red-panda\`/\`wah\`
                     - \`wolf\`/\`awoo\`
                  `)
                  .setFooter({
                     text: `🏷️ Surround arguments with " or ' to create a single argument.`
                  })
            ],
            allowedMentions: {
               parse: []
            }
         });
      };


      // hi/hai/hello/hewwo/howdy/meowdy/hey/hoi
      case `hi`:
      case `hai`:
      case `hello`:
      case `hewwo`:
      case `howdy`:
      case `meowdy`:
      case `hey`:
      case `hoi`: {
         return await interaction.reply({
            content: toCommand(
               choice([
                  `hi!`,
                  `hai!`,
                  `hello!`,
                  `hewwo!`,
                  `howdy!`,
                  `meowdy!`,
                  `hey!`,
                  `hoi!`,
                  `wsg`
               ])
            ),
            allowedMentions: {
               parse: []
            }
         });
      };


      // pancake/pancakes
      case `pancake`:
      case `pancakes`: {
         await interaction.reply({
            content: toCommand(emojis.loading),
            allowedMentions: {
               parse: []
            }
         });

         const pancakeDocRef  = firestore.collection(`pancake`).doc(interaction.guild.id);
         const pancakeDocSnap = await pancakeDocRef.get();
         const pancakeDocData = pancakeDocSnap.data() || {};

         const pancakeUserData = pancakeDocData[interaction.user.id] || {};

         const canGetPancake = (pancakeUserData[`next-pancake-at`]?.seconds || 0) < dayjs().unix();
         if (!canGetPancake)
            return await interaction.editReply({
               content: toCommand(strip`
                  You have 🥞 \`${pancakeUserData.pancakes || 0}\` ${pancakeUserData.pancakes === 1 ? `pancake` : `pancakes`}.
                  You can redeem another ${Discord.time(dayjs.utc().startOf(`day`).add(1, `day`).unix(), Discord.TimestampStyles.RelativeTime)}.
               `),
               allowedMentions: {
                  parse: []
               }
            });

         await pancakeDocRef.update({
            [`${interaction.user.id}.next-pancake-at`]: new Timestamp(dayjs.utc().startOf(`day`).add(1, `day`).unix(), 0),
            [`${interaction.user.id}.pancakes`]:        FieldValue.increment(1)
         });

         return await interaction.editReply({
            content: toCommand(
               choice([
                  `Good to see you again, ${interaction.user}. Here is your 🥞 pancake!`,
                  `Welcome back, fair ${interaction.user}. Your 🥞 pancake is here.`,
                  `Here is your 🥞 pancake, ${interaction.user}: with ground hazelnuts in the batter.`,
                  `Here is your fluffy, syrupy 🥞 pancake, ${interaction.user}.`,
                  `Dear ${interaction.user}, your 🥞 pancake is here.`,
                  `Hello, ${interaction.user}, your 🥞 pancake awaits you.`,
                  `The Solstice *is* real, ${interaction.user}. Here is your 🥞 pancake.`
               ])
            ),
            allowedMentions: {
               parse: []
            }
         });
      };


      // pet
      case `pet`: {
         await interaction.reply({
            content: toCommand(emojis.loading),
            allowedMentions: {
               parse: []
            }
         });

         const petDocRef  = firestore.collection(`pet`).doc(interaction.guild.id);
         const petDocSnap = await petDocRef.get();
         const petDocData = petDocSnap.data() || {};

         const totalPets = sum(Object.values(petDocData).map(data => data.pets));
         const petUserData = petDocData[interaction.user.id] || {};

         const canGetPancake = (petUserData[`next-pet-at`]?.seconds || 0) < dayjs().unix();
         if (!canGetPancake)
            return await interaction.editReply({
               content: toCommand(strip`
                  The 🦊 has been pet \`${totalPets || 0}\` ${totalPets === 1 ? `time` : `times`} in this server.
                  You have pet the 🦊 \`${petUserData.pets || 0}\` ${petUserData.pets === 1 ? `time` : `times`} in this server.
                  You can pet it again ${Discord.time(petUserData[`next-pet-at`].seconds, Discord.TimestampStyles.RelativeTime)}.
               `),
               allowedMentions: {
                  parse: []
               }
            });

         await petDocRef.update({
            [`${interaction.user.id}.next-pet-at`]: new Timestamp(dayjs.utc().add(1, `hour`).unix(), 0),
            [`${interaction.user.id}.pets`]:        FieldValue.increment(1)
         });

         return await interaction.editReply({
            content: toCommand(strip`
               You pet the 🦊.
               The 🦊 has been pet \`${(totalPets || 0) + 1}\` ${(totalPets || 0) + 1 === 1 ? `time` : `times`} in this server.
            `),
            allowedMentions: {
               parse: []
            }
         });
      };


      // rate
      case `rate`: {
         const thingToRate = command
            .slice(command.toLowerCase().indexOf(commandName) + commandName.length)
            .trim();

         if (!thingToRate)
            return await interaction.reply({
               content: toCommand(`ERR: nothing to rate`),
               allowedMentions: {
                  parse: []
               },
               ephemeral: true
            });

         return await interaction.reply({
            content: toCommand(`✨ ${
               choice([
                  `hmm, i'll rate \`${thingToRate}\` a`,
                  `\`${thingToRate}\` gets a`,
                  `i rate \`${thingToRate}\` a`,
                  `\`${thingToRate}\` is a certified`
               ])
            } **\`${number(1, 10)}\`**`),
            allowedMentions: {
               parse: []
            }
         });
      };


      // roll/dice
      case `roll`:
      case `dice`: {
         const max = +args[0] || 6;

         return await interaction.reply({
            content: toCommand(`🎲 ${number(1, max)} (1-${max})`),
            allowedMentions: {
               parse: []
            }
         });
      };


   };


   // unknown command
   await interaction.reply({
      content: toCommand(`ERR: command not found`),
      allowedMentions: {
         parse: []
      },
      ephemeral: true
   });
};