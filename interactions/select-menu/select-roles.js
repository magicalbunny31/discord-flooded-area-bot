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
         [ `updates-sneak-peaks`,       rolesStrings.includes(`updates-sneak-peaks`)       ],
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
   const database = firestore.collection(`role`);
   const roles = (await database.doc(type).get()).data();


   // give the member these roles
   const [ rolesToAdd, rolesToRemove ] = partition(setRoles, value => value[1]);

   await interaction.member.roles.add(
      rolesToAdd.map(roleId => roles[roleId[0]])
   );

   await interaction.member.roles.remove(
      rolesToRemove.map(roleId => roles[roleId[0]])
   );
};