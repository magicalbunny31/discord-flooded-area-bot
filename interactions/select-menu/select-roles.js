import Discord from "discord.js";
import { partition } from "@magicalbunny31/awesome-utility-stuff";

/**
 * set reaction roles
 * @param {Discord.SelectMenuInteraction} interaction
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (interaction, redis) => {
   // select menu info
   const [ _selectMenu, type ] = interaction.customId.split(`:`);
   const rolesStrings = interaction.values;


   // defer the interaction's update
   await interaction.deferUpdate();


   // this member's roles and whether they're set or not
   const setRoles = {
      mentions: [
         [ `looking-for-group`,         rolesStrings.includes(`looking-for-group`)         ],
         [ `events`,                    rolesStrings.includes(`events`)                    ],
         [ `polls`,                     rolesStrings.includes(`polls`)                     ],
         [ `updates-sneak-peaks`,       rolesStrings.includes(`updates-sneak-peaks`)       ],
         [ `giveaways`,                 rolesStrings.includes(`giveaways`)                 ],
         [ `challenges`,                rolesStrings.includes(`challenges`)                ],
         [ `doruk's-exceptional-pings`, rolesStrings.includes(`doruk's-exceptional-pings`) ]
      ]
   }[type];


   // get role ids to set for this member
   const roles = await redis.HGETALL(`flooded-area:role:${type}`);


   // give the member these roles
   const [ rolesToAdd, rolesToRemove ] = partition(setRoles, value => value[1]);

   await interaction.member.roles.add(
      rolesToAdd.map(roleId => roles[roleId[0]])
   );

   await interaction.member.roles.remove(
      rolesToRemove.map(roleId => roles[roleId[0]])
   );
};