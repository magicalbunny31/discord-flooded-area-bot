export const name = Discord.Events.MessageCreate;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Message} message
 * @param {ReturnType<typeof import("redis").createClient>} redis
 */
export default async (message, redis) => {
   // melvin
   const melvinId = `776627280498786355`;
   const nerd = `🤓`;


   // this isn't the Flooded Area Community guild
   if (message.guild?.id !== `977254354589462618`)
      return;


   // this message isn't from melvin
   if (message.author.id !== melvinId)
      return;


   // the message's content doesn't contain "🤓";
   if (!message.content.includes(nerd))
      return;


   try {
      // time out melvin
      await message.member.timeout(3.6e+6, `stop saying 🤓 (~ arlo + bunny)`);


      // reply to the message
      await message.reply({
         content: `<:trollface:986018189324468304>`
      });


   } catch {
      // no perms lmao
      return;
   };
};