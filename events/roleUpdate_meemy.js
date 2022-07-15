export const name = `roleUpdate`;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Role} oldRole
 * @param {Discord.Role} newRole
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (oldRole, newRole, redis) => {
   // meemy
   const name = `MIMI!`;
   const colour = 0xff4962;


   // this isn't the Flooded Area Community guild
   if (oldRole.guild.id !== `977254354589462618`)
      return;


   // the "MIMI!" role was edited
   const oldRoleMimi    = oldRole.name === name && oldRole.color === colour;
   const newRoleNotMimi = newRole.name !== name || newRole.color !== colour;

   if (!(oldRoleMimi && newRoleNotMimi))
      return;


   // revert the role's changes lmao
   await newRole.edit({
      name,
      color: colour,
      reason: `:troll: (~ bunny)`
   });
};