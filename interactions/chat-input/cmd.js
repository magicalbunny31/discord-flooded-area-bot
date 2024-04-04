export const name = "cmd";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_UNIVERSE_LABORATORIES ];

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
import { colours, emojis, choice, number, partition, strip, sum, wait } from "@magicalbunny31/awesome-utility-stuff";

import pkg from "../../package.json" assert { type: "json" };

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // options
   const command = interaction.options.getString(`command`);


   // function to try to fetch something or return undefined instead of throwing
   const tryOrUndefined = async promise => {
      try {
         return await promise;
      } catch {
         return undefined;
      };
   };


   // function to check if a user is in this guild
   const userIsInGuild = async userId => !!await tryOrUndefined(interaction.guild.members.fetch(userId));


   // data to show
   const data = {
      [process.env.GUILD_FLOODED_AREA]: {
         colour: colours.flooded_area
      },

      [process.env.GUILD_UNIVERSE_LABORATORIES]: {
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
            .map(line => `> ${line}`)
            .join(`\n`)
      ]
         .filter(Boolean)
         .join(`\n`);
   };


   // run command
   switch (commandName) {


      // :3
      case `:3`: {
         await interaction.reply({
            content: toCommand(emojis.loading),
            allowedMentions: {
               parse: []
            }
         });

         return await interaction.editReply({
            content: toCommand(),
            files: [
               new Discord.AttachmentBuilder()
                  .setFile(`./assets/cmd/colon-three.png`)
            ],
            allowedMentions: {
               parse: []
            }
         });
      };


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
         const flagUs = `🇺🇸`;
         const flagGb = `🇬🇧`;

         const flippedAmerica = `<:flipped_america:1116431279185993899>`;
         const americanFlag   = `<:american_flag:1061290300343066645>`;
         const prideFlag      = `<:pride_flag:1113838962084155442>`;

         await interaction.reply({
            content: toCommand(emojis.loading),
            allowedMentions: {
               parse: []
            }
         });

         return await interaction.editReply({
            content: toCommand(
               [
                  `-  \`america\`: 85%`,
                  ` - ${flagUs}: 40%`,
                  ` - ${americanFlag}: 40%`,
                  ` - ${prideFlag}: 20%`,
                  `- 🌊 \`flood\`: 5%`,
                  `- 🛰️ \`space\`: 5%`,
                  `- ${emojis.happ} \`furry\`: 4%`,
                  ` - ..Or, 50% if you have the ${Discord.roleMention(process.env.FA_ROLE_BUNNY_WAS_HERE)} role!`,
                  ` - (All other chances balance out to create the other 50%)`,
                  `- ${flippedAmerica} \`flipped\`: 0.9%`,
                  `- ✨ \`rare\`: 0.09%`,
                  `- 🌟 \`rarer\`: 0.009%`,
                  `- ${flagGb} \`british\`: 0.001%`
               ]
                  .join(`\n`)
            ),
            components: [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.ButtonBuilder()
                        .setLabel(`View raw /america chances`)
                        .setEmoji(emojis.area_communities_bot)
                        .setStyle(Discord.ButtonStyle.Link)
                        .setURL(`https://github.com/magicalbunny31/discord-area-communities-bot/blob/main/interactions/chat-input/america.js#L33-L74`)
                  )
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


      // h/help/cmd/command/cmds/commands
      case `h`:
      case `help`:
      case `cmd`:
      case `command`:
      case `cmds`:
      case `commands`: {
         return await interaction.reply({
            content: toCommand(),
            embeds: [
               new Discord.EmbedBuilder()
                  .setColor(data.colour)
                  .setTitle(`📋 Commands for ${emojis.area_communities_bot} ${Discord.chatInputApplicationCommandMention(interaction.commandName, interaction.commandId)}`)
                  .setDescription(strip`
                     - \`:3\`
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
                     - \`p\`/\`pancake\`/\`pancakes\` (\`lb\`/\`leaderboard\`/\`leaderboards\`)
                     - \`pet\`
                     - \`rabbit\`/\`bunny\`/\`bun\`/\`bunbun\`
                     - \`rate\`
                     - \`roll\`/\`dice\`
                     - \`red-panda\`/\`wah\`
                     - \`unique-username-statistics\`/\`unique\`/\`username\`/\`usernames\`/\`uus\`
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


      // p/pancake/pancakes
      //                    lb/leaderboard/leaderboards
      case `p`:
      case `pancake`:
      case `pancakes`:
         switch (args[0]?.toLowerCase()) {
            default: {
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


            case `lb`:
            case `leaderboard`:
            case `leaderboards`: {
               await interaction.reply({
                  content: toCommand(emojis.loading),
                  allowedMentions: {
                     parse: []
                  }
               });

               const pancakeDocRef  = firestore.collection(`pancake`).doc(interaction.guild.id);
               const pancakeDocSnap = await pancakeDocRef.get();
               const pancakeDocData = pancakeDocSnap.data() || {};

               const data = Object.entries(pancakeDocData)
                  .sort(([ _aKey, a ], [ _bKey, b ]) => b.pancakes - a.pancakes);

               const size = 15;
               const rawIndex = (+args[1] || 1) - 1;
               const index = Math.ceil(data.length / size) > rawIndex && rawIndex > 0
                  ? rawIndex
                  : 0;
               const entriesToShow = data.slice(index * size, size + (index * size));

               const page = (
                  await Promise.all(
                     entriesToShow
                        .map(async ([ userId, { pancakes }], i) => {
                           const placement = (i + 1) + (index * size);
                           const nameDisplayed = await userIsInGuild(userId)
                              ? Discord.userMention(userId)
                              : `@${Discord.escapeMarkdown((await tryOrUndefined(interaction.client.users.fetch(userId)))?.username || userId)}`;
                           return `${placement}. ${nameDisplayed} : 🥞 \`${pancakes}\``;
                        })
                  )
               )
                  .join(`\n`);

               return await interaction.editReply({
                  content: toCommand(page),
                  allowedMentions: {
                     parse: []
                  }
               });
            };
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

         const canPet = (petUserData[`next-pet-at`]?.seconds || 0) < dayjs().unix();
         if (!canPet)
            return await interaction.editReply({
               content: toCommand(strip`
                  The 🦊 has been pet \`${totalPets || 0}\` ${totalPets === 1 ? `time` : `times`} in this server.
                  You have pet the 🦊 \`${petUserData.pets || 0}\` ${petUserData.pets === 1 ? `time` : `times`}.
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


      // unique-username-statistics/unique/username/usernames/uus
      case `unique-username-statistics`:
      case `unique`:
      case `username`:
      case `usernames`:
      case `uus`: {
         await interaction.reply({
            content: toCommand(emojis.loading),
            allowedMentions: {
               parse: []
            }
         });

         const members = await (async () => {
            const fetchedMembers = [];
            let lastMember;
            while (true) {
               const members = (await interaction.guild.members.list({ limit: 1000, ...fetchedMembers.length ? { after: fetchedMembers.at(-1).id } : {} }));
               fetchedMembers.push(...members.values());
               if (lastMember?.id === fetchedMembers.at(-1).id)
                  break;
               else
                  lastMember = fetchedMembers.at(-1);
               await wait(1000);
            };

            return fetchedMembers;
         })();

         const [ uniqueUsernameMembers, oldUsernameMembers ] = partition(members, member => member.user.discriminator === `0`);

         const colour = {
            [process.env.GUILD_FLOODED_AREA]: colours.flooded_area,
            [process.env.GUILD_UNIVERSE_LABORATORIES]:   colours.spaced_out
         }[interaction.guild.id];

         const embeds = [
            new Discord.EmbedBuilder()
               .setColor(colour)
               .setFields({
                  name: `Members with Unique Usernames (\`@${choice(uniqueUsernameMembers).user.username}\`)`,
                  value: `> ${uniqueUsernameMembers.length.toLocaleString()} members`,
                  inline: true
               }, {
                  name: `Members with old usernames (\`@${choice(oldUsernameMembers).user.tag}\`)`,
                  value: `> ${oldUsernameMembers.length.toLocaleString()} members`,
                  inline: true
               })
         ];

         return await interaction.editReply({
            content: toCommand(),
            embeds,
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