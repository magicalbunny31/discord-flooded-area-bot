export const name = Discord.Events.ClientReady;
export const once = true;


import Discord from "discord.js";
import fs from "fs/promises";

/**
 * will run once, when the bot has logged into discord and is ready
 * @param {Discord.Client} client
 */
export default async client => {
   // remove guild commands from all guilds
   (await client.guilds.fetch())
      .forEach(async guild =>
         await client.application.commands.set([], guild.id)
      );


   // get all chat-input application command files
   const commands = await fs.readdir(`./commands/chat-input`);


   // map all chat-input application command files into their data
   const data = await Promise.all(
      commands.map(async file =>
         (await import(`../commands/chat-input/${file}`)).data
      )
   );


   // register application commands in the GUILD defined in .env
   await client.application.commands.set(data, process.env.GUILD);


   // bot is ready
   console.log(`🤖 discord bot ready~`);
};