export const cron = {
   // at every hour
   minute: 0
};

/**
 * @param {import("@bun-types/client").default} client
 * @param {import("@google-cloud/firestore").Firestore} firestore
 */
export default async (client, firestore) => {
   // update the blacklist
   client.blacklist = await client.fennec.getGlobalBlacklist();
};