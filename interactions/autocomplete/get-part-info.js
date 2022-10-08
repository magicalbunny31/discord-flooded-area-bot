import Discord from "discord.js";
import { findSimilar } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.AutocompleteInteraction} interaction
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (interaction, firestore) => {
   // autocomplete info
   const input = interaction.options.getFocused();


   // part names/ids
   const parts = [{
      name: `🎈 balloon`,
      value: `Balloon`
   }, {
      name: `🎈 big balloon`,
      value: `Big_Balloon`
   }, {
      name: `💣 big explosive`,
      value: `Big_Explosive`
   }, {
      name: `🖥️ big gaming computer`,
      value: `Big_Gaming_Computer`
   }, {
      name: `🍞 bread`,
      value: `Bread`
   }, {
      name: `🔘 button`,
      value: `Button`
   }, {
      name: `🔨 crafting table`,
      value: `Crafting_Table`
   }, {
      name: `💣 explosive`,
      value: `Explosive`
   }, {
      name: `💥 explosive shock`,
      value: `Explosive_Shock`
   }, {
      name: `🛏️ fabric`,
      value: `Fabric`
   }, {
      name: `🖥️ gaming computer`,
      value: `Gaming_Computer`
   }, {
      name: `🪟 glass`,
      value: `Glass`
   }, {
      name: `🔦 laser`,
      value: `Lazer`
   }, {
      name: `🍃 leaves`,
      value: `Leaves`
   }, {
      name: `💡 light (normal)`,
      value: `Light`
   }, {
      name: `💡 red light`,
      value: `Red_Light`
   }, {
      name: `💡 green light`,
      value: `Green_Light`
   }, {
      name: `💡 blue light`,
      value: `Blue_Light`
   }, {
      name: `💡 yellow light`,
      value: `Yellow_Light`
   }, {
      name: `💡 cyan light`,
      value: `Cyan_Light`
   }, {
      name: `💡 pink light`,
      value: `Pink_Light`
   }, {
      name: `🚧 metal`,
      value: `Metal`
   }, {
      name: `🪢 rope bundle`,
      value: `Rope_Bundle`
   }, {
      name: `📺 screen`,
      value: `Screen`
   }, {
      name: `🪨 stone`,
      value: `Stone`
   }, {
      name: `🚀 thruster`,
      value: `Thruster`
   }, {
      name: `💡 wired light`,
      value: `Wired_Light`
   }, {
      name: `🪵 wood`,
      value: `Wood`
   }, {
      name: `🛢️ oil`,
      value: `Oil`
   }, {
      name: `🫘 beans`,
      value: `Beans`
   }, {
      name: `🍪 cookie`,
      value: `Cookie`
   }, {
      name: `🎶 music player`,
      value: `Music_Player`
   }, {
      name: `🎶 rusty music player (broken)`,
      value: `Rusty_Music_Player`
   }, {
      name: `⬜ plastic`,
      value: `Plastic`
   }, {
      name: `🧀 cheese`,
      value: `Cheese`
   }, {
      name: `💧 air tank`,
      value: `Air_Tank`
   }, {
      name: `📦 container`,
      value: `Container`
   }, {
      name: `🌾 farming plot`,
      value: `Farming_Plot`
   }, {
      name: `💰 money bag`,
      value: `Money_Bag`
   }, {
      name: `🏭 oil pump`,
      value: `Oil_Pump`
   }, {
      name: `🪜 wooden truss`,
      value: `Wooden_Truss`
   }, {
      name: `🎁 present (1)`,
      value: `Present_1`
   }, {
      name: `🎁 present (2)`,
      value: `Present_2`
   }, {
      name: `🎁 present (3)`,
      value: `Present_3`
   }, {
      name: `🕳️ grate`,
      value: `Grator`
   }, {
      name: `🏗️ corroded metal`,
      value: `CorrodedMetal`
   }, {
      name: `👚 fabric wheel`,
      value: `Fabric_Wheel`
   }, {
      name: `🛞 motor`,
      value: `Motor`
   }, {
      name: `💺 seat`,
      value: `Seat`
   }, {
      name: `🔒 locked seat`,
      value: `Locked_Seat`
   }, {
      name: `🏴 american flag`,
      value: `American_Flag`
   }, {
      name: `🍰 cake`,
      value: `Cake`
   }, {
      name: `💨 whoopee cushion (broken)`,
      value: `Whoopee_Cushion`
   }, {
      name: `⚡ junction`,
      value: `Junction`
   }]
      .sort((a, b) => a.value.localeCompare(b.value));


   // no input, return first 25 parts
   if (!input)
      return await interaction.respond(
         parts.slice(0, 25)
      );


   // sort parts based on input
   const sortedParts = findSimilar(input, parts, {
      key: `value`,
      limit: 25,
      minScore: 0.2
   });


   // respond to the interaction
   return await interaction.respond(
      sortedParts.map(sortedPart => sortedPart.object)
   );
};