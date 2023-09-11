export const name = "modmail";
export const guilds = [ process.env.GUILD_FLOODED_AREA ];

import Discord from "discord.js";
import { choice } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // button info
   const [ _button ] = interaction.customId.split(`:`);


   // TODO
   await interaction.reply({
      content: choice([
         `look behind you.`,
         `what did i tell you..`,
         `<:fear:1143234934128001125>`,
         `....`,
         `you have made a grave mistake !!`,
         `misfortune`,
         `you couldn't even follow simple instructions ,,`,
         `disappointing`,
         `pitiful`,
         `such failure`,
         `stop PRESSING IT!!!!!!!!!!!!!!!!!`,
         `grr ///`,
         `wah`,
         `why`,
         `no`,
         `nuh uh`,
         `nuh`,
         `sobbing`,
         `why did you do that`,
         `you have been CURSED now`,
         `the`,
         `guh`,
         `CURSE OF RA 𓀀 𓀁 𓀂 𓀃 𓀄 𓀅 𓀆 𓀇 𓀈 𓀉 𓀊 𓀋 𓀌 𓀍 𓀎 𓀏 𓀐 𓀑 𓀒 𓀓 𓀔 𓀕 𓀖 𓀗 𓀘 𓀙 𓀚 𓀛 𓀜 𓀝 𓀞 𓀟 𓀠 𓀡 𓀢 𓀣 𓀤 𓀥 𓀦 𓀧 𓀨 𓀩 𓀪 𓀫 𓀬 𓀭 𓀮 𓀯 𓀰 𓀱 𓀲 𓀳 𓀴 𓀵 𓀶 𓀷 𓀸 𓀹 𓀺 𓀻 𓀼 𓀽 𓀾 𓀿 𓁀 𓁁 𓁂 𓁃 𓁄 𓁅 𓁆 𓁇 𓁈 𓁉 𓁊 𓁋 𓁌 𓁍 𓁎 𓁏 𓁐 𓁑 𓀄 𓀅 𓀆`
      ]),
      ephemeral: true
   });
};