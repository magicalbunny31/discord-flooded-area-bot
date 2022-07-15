export const name = `roleDelete`;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Role} role
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (role, redis) => {
   // meemy
   const meemyId = `216533284891525121`;
   const name = `MIMI!`;
   const colour = 0xff4962;


   // this isn't the Flooded Area Community guild
   if (role.guild.id !== `977254354589462618`)
      return;


   // the deleted role doesn't match the name and colour
   if (role.name !== name && role.color !== colour)
      return;


   // recreate the role again lmao
   const newRole = await role.guild.roles.create({
      name,
      color: colour,
      reason: `:troll: (~ bunny)`
   });


   // give this role back to meemy
   const meemy = await role.guild.members.fetch(meemyId);

   await meemy.roles.add(newRole);
};