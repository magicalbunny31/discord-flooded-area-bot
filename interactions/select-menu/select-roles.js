import Discord from "discord.js";
import { partition } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.AnySelectMenuInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // select menu info
   const [ _selectMenu, type ] = interaction.customId.split(`:`);
   const rolesStrings = interaction.values;


   // defer the interaction's update
   await interaction.deferUpdate();


   // this member's roles and whether they're set or not
   const setRoles = {
      "mention-roles": [
         [ `looking-for-group`,         rolesStrings.includes(`looking-for-group`)         ],
         [ `events`,                    rolesStrings.includes(`events`)                    ],
         [ `polls`,                     rolesStrings.includes(`polls`)                     ],
         [ `updates-sneak-peeks`,       rolesStrings.includes(`updates-sneak-peeks`)       ],
         [ `giveaways`,                 rolesStrings.includes(`giveaways`)                 ],
         [ `challenges`,                rolesStrings.includes(`challenges`)                ],
         [ `doruk's-exceptional-pings`, rolesStrings.includes(`doruk's-exceptional-pings`) ],
         [ `votekick-pings`,            rolesStrings.includes(`votekick-pings`)            ]
      ],

      "pronoun-roles": [
         [ `he-him`,           rolesStrings.includes(`he-him`)           ],
         [ `she-her`,          rolesStrings.includes(`she-her`)          ],
         [ `they-them`,        rolesStrings.includes(`they-them`)        ],
         [ `other-pronouns`,   rolesStrings.includes(`other-pronouns`)   ],
         [ `any-pronouns`,     rolesStrings.includes(`any-pronouns`)     ],
         [ `ask-for-pronouns`, rolesStrings.includes(`ask-for-pronouns`) ]
      ]
   }[type];


   // get role ids to set for this member
   const roles = {
      "mention-roles": {
         "looking-for-group":         process.env.ROLE_LOOKING_FOR_GROUP,
         "events":                    process.env.ROLE_EVENTS,
         "polls":                     process.env.ROLE_POLLS,
         "updates-sneak-peeks":       process.env.ROLE_UPDATES_SNEAK_PEEKS,
         "giveaways":                 process.env.ROLE_GIVEAWAYS,
         "challenges":                process.env.ROLE_CHALLENGES,
         "doruk's-exceptional-pings": process.env.ROLE_DORUKS_EXCEPTIONAL_PINGS,
         "votekick-pings":            process.env.ROLE_VOTEKICK_PINGS
      },

      "pronoun-roles": {
         "he-him":           process.env.ROLE_HE_HIM,
         "she-her":          process.env.ROLE_SHE_HER,
         "they-them":        process.env.ROLE_THEY_THEM,
         "other-pronouns":   process.env.ROLE_OTHER_PRONOUNS,
         "any-pronouns":     process.env.ROLE_ANY_PRONOUNS,
         "ask-for-pronouns": process.env.ROLE_ASK_FOR_PRONOUNS
      }
   }[type];


   // give the member these roles
   const [ rolesToAdd, rolesToRemove ] = partition(setRoles, value => value[1]);

   await interaction.member.roles.add(
      rolesToAdd.map(roleId => roles[roleId[0]])
   );

   await interaction.member.roles.remove(
      rolesToRemove.map(roleId => roles[roleId[0]])
   );
};