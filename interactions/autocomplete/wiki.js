export const name = "wiki";
export const guilds = [ process.env.GUILD_FLOODED_AREA, process.env.GUILD_SPACED_OUT ];


import Discord from "discord.js";

import pkg from "../../package.json" assert { type: "json" };

/**
 * @param {Discord.AutocompleteInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // autocomplete info
   const input = interaction.options.getFocused();


   // TODO
   if (interaction.guild.id === process.env.GUILD_SPACED_OUT)
      return await interaction.respond([]);


   // no input
   if (!input)
      return await interaction.respond([]);


   // user-agent string
   const userAgent = `${pkg.name}/${pkg.version} (https://github.com/${pkg.author}/${pkg.name})`;


   // request url and query string
   const baseUrl = (() => {
      switch (interaction.guild.id) {
         case process.env.GUILD_FLOODED_AREA: return `https://flooded-area-official.fandom.com`;
         case process.env.GUILD_SPACED_OUT:   return `https://spacedout1.fandom.com`;
      };
   })();

   const query = [
      `action=query`,
      `list=search`,
      `srsearch=${input}`,
      `srlimit=25`,
      `format=json`
   ]
      .join(`&`);


   // send a request to the api
   const response = await fetch(`${baseUrl}/api.php?${query}`, {
      headers: {
         "Accept": `application/json`,
         "User-Agent": userAgent
      }
   });


   // bad response
   if (!response.ok) {
      await interaction.respond([]);

      return await interaction.client.fennec.sendError(
         new Error(`HTTP ${response.status} ${response.statusText}`),
         Math.floor(interaction.createdTimestamp / 1000),
         interaction
      );
   };


   // parse the response data
   const data = await response.json();
   const foundPages = data.query.search;
   const options = foundPages.map(foundPage =>
      ({
         name: foundPage.title,
         value: foundPage.title
      })
   );


   // return the options
   await interaction.respond(options);
};