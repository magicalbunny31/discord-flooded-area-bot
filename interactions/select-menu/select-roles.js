export const name = "select-roles";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import { partition } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.StringSelectMenuInteraction} interaction
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
         [ `looking-for-group`,   rolesStrings.includes(`looking-for-group`)         ],
         [ `events`,              rolesStrings.includes(`events`)                    ],
         [ `polls`,               rolesStrings.includes(`polls`)                     ],
         [ `updates-sneak-peeks`, rolesStrings.includes(`updates-sneak-peeks`)       ],
         [ `giveaways`,           rolesStrings.includes(`giveaways`)                 ],
         [ `challenges`,          rolesStrings.includes(`challenges`)                ],
         [ `playtest`,            rolesStrings.includes(`playtest`)                  ],
         [ `archived-access`,     rolesStrings.includes(`archived-access`)           ]
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
         "looking-for-group":   process.env.FA_ROLE_LOOKING_FOR_GROUP,
         "events":              process.env.FA_ROLE_EVENTS,
         "polls":               process.env.FA_ROLE_POLLS,
         "updates-sneak-peeks": process.env.FA_ROLE_UPDATES_SNEAK_PEEKS,
         "giveaways":           process.env.FA_ROLE_GIVEAWAYS,
         "challenges":          process.env.FA_ROLE_CHALLENGES,
         "playtest":            process.env.FA_ROLE_PLAYTEST,
         "archived-access":     process.env.FA_ROLE_ARCHIVED_ACCESS
      },

      "pronoun-roles": {
         "he-him":           process.env.FA_ROLE_HE_HIM,
         "she-her":          process.env.FA_ROLE_SHE_HER,
         "they-them":        process.env.FA_ROLE_THEY_THEM,
         "other-pronouns":   process.env.FA_ROLE_OTHER_PRONOUNS,
         "any-pronouns":     process.env.FA_ROLE_ANY_PRONOUNS,
         "ask-for-pronouns": process.env.FA_ROLE_ASK_FOR_PRONOUNS
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