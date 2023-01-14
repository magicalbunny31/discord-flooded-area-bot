import Discord from "discord.js";
import dayjs from "dayjs";

/**
 * @param {Discord.AutocompleteInteraction} interaction
 */
export default async interaction => {
   // options
   const { value: input } = interaction.options.getFocused(true);


   /**
    * show default options if:
    * - no input
    * - input can't be cast to a number
    * - input is less than 1 second
    * - input exceeds the max safe integer
    */
   if (!input || !+input || +input < 1 || +input > Number.MAX_SAFE_INTEGER)
      return await interaction.respond(
         [{
            name: `✨ 30 minutes`,
            value: 1800
         }, {
            name: `✨ 1 hour`,
            value: 3600
         }, {
            name: `✨ 6 hours`,
            value: 21600
         }, {
            name: `✨ 1 day`,
            value: 86400
         }, {
            name: `✨ 3 days`,
            value: 259200
         }, {
            name: `✨ 1 week`,
            value: 604800
         }, {
            name: `✨ 2 weeks`,
            value: 1209600
         }, {
            name: `✨ 1 month`,
            value: 2592000
         }]
      );


   // formatted humanised time
   const formattedDuration = (() => {
      const format = [];
      const duration = dayjs.duration(+input, `seconds`);

      const days = (duration.years() * 365) + (duration.months() * 30) + duration.days();

      if (duration.asDays()    >= 1) format.push(`${days} ${days === 1 ? `day` : `days`}`);
      if (duration.asHours()   >= 1) format.push(`${duration.hours()} ${duration.hours() === 1 ? `hour` : `hours`}`);
      if (duration.asMinutes() >= 1) format.push(`${duration.minutes()} ${duration.minutes() === 1 ? `minute` : `minutes`}`);
      if (duration.asSeconds() >= 1) format.push(`${duration.seconds()} ${duration.seconds() === 1 ? `second` : `seconds`}`);

      return format.join(`, `);
   })();


   // send autocomplete results
   return await interaction.respond(
      [{
         name: formattedDuration,
         value: +input
      }]
   );
};