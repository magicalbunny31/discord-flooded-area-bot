export const name = `guildMemberUpdate`;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.GuildMember} oldMember
 * @param {Discord.GuildMember} newMember
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (oldMember, newMember, redis) => {
   // meemy
   const meemyId = `216533284891525121`;
   const name = `MIMI!`;
   const colour = 0xff4962;


   // this isn't the Flooded Area Community guild
   if (oldMember.guild?.id !== `977254354589462618`)
      return;


   // this isn't meemy
   if (oldMember.id !== meemyId)
      return;


   // meemy's "MIMI!" role wasn't removed
   const oldMemberHasRole    = !!oldMember.roles.cache.find(role => role.name === name && role.color === colour);
   const newMemberNotHasRole =  !newMember.roles.cache.find(role => role.name === name && role.color === colour);

   if (!(oldMemberHasRole && newMemberNotHasRole))
      return;


   // the role was deleted, `./roleDelete_meemy.js` will take care of this
   const role = (await oldMember.guild.roles.fetch()).find(role => role.name === name && role.color === colour);

   if (!role)
      return;


   // give the role back to meemy
   const meemy = await oldMember.guild.members.fetch(meemyId);

   await meemy.roles.add(role);
};