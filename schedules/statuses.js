export const cron = "*/10 * * * *"; // at every 10th minute

import Discord from "discord.js";
import { choice } from "@magicalbunny31/awesome-utility-stuff";

import pkg from "../package.json" assert { type: "json" };

/**
 * @param {import("discord.js").Client} client
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (client, firestore) => {
   // user-agent string
   const userAgent = `${pkg.name}/${pkg.version} (https://nuzzles.dev/area-communities-bot)`;


   // offline-soon or maintenance
   const fennecStatus = await client.fennec.getStatus();
   if ([ `offline-soon`, `maintenance` ].includes(fennecStatus))
      return client.user.setPresence({
         status: Discord.PresenceUpdateStatus.DoNotDisturb,
         activities: [{
            name: `${fennecStatus === `offline-soon` ? `i'll be offline soon~` : `currently in maintenance!`} 🔧`,
            type: Discord.ActivityType.Custom
         }]
      });


   // fetch player counts for the games
   const [ floodedAreaPlayerCount, spacedOutPlayerCount ] = await (async () => {
      const response = await fetch(`https://games.roblox.com/v1/games?universeIds=1338193767,4746031883`, {
         headers: {
            "Accept": `application/json`,
            "User-Agent": userAgent
         }
      });

      if (response.ok) {
         const json = await response.json();
         return [ json.data[0].playing || 0, json.data[1].playing || 0 ];
      } else
         return [ 0, 0 ];
   })();


   // list of statuses
   const statuses = [
      `Flooded Area 🌊`,
      `Spaced Out 🌌`,
      `visit bunny's shop with /currency shop`,
      `view your level with /levels`,
      `your suggestions are cool`,
      `star messages to get them on the starboard!`,
      `try fox bot`,
      `STOP GRIEFING ME!!!!!`,
      `don't touch the waves :scary:`,
      `when will there be a new challenge?`,
      `trying to build a boat`,
      `trying to build a rocket`,
      `when's the next event?`,
      `hello, chat!`,
      `hello world`,
      `don't dm me for modmail`,
      `i got votekicked for eating bread`,
      `@everyone`,
      `hi`,
      `i hate flooded a`,
      `zzz`,
      `what are you looking at?!`,
      `🤓☝️`,
      `why are you in this server`,
      `balls`,
      `whar`,
      `:3`,
      `/cmd pancakes`,
      `raphael ate ALL my balls and now i'm sad`,
      `erm, what the tuna?`,
      `fish issue`,
      `#hugo2023`,
      `le tape`,
      `rawr ✨`,
      `halo is a cutie`,
      `can i have cool role`,
      `don't get rabies it's bad for you`,
      `why does the sun give us light when it's already bright`,
      `flooded area lost the braincells it never had from spaced out`,
      `flooded area mfs when their family members drown inside a flood and die (flooded area reference)`,
      `thousands of players active (flooded area reference)`,
      `boat = flooded area`,
      `/america`,
      `this bot was made by a furry`,
      `sily !`,
      `need a dispenser here`,
      `spy!`,
      `his mom its a cancer`,
      `good morning let's basketball`,
      `HUH`,
      `YOU MASH`,
      `the streets aint for u cuzzz`,
      `NOT READING ALLAT 🤦‍♂️🤣`,
      `be nice to each other`,
      `go back to your cage you animal`,
      `boop haiii`,
      `i forgor`,
      `cheese`,
      `bread`,
      `[BLIZZARD] WAS HERE!!`,
      `boo!`
   ];
   const status = choice(statuses);


   // set status
   client.user.setPresence({
      status: Discord.PresenceUpdateStatus.Idle,
      activities: [{
         name: `${status} • 🌊👥${floodedAreaPlayerCount} • 🌌👥${spacedOutPlayerCount}`,
         type: Discord.ActivityType.Custom
      }]
   });
};