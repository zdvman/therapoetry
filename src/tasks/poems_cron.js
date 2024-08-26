// poems_cron.js - file for setting up cron jobs for deleting expired poems

// Import the cron library
import cron from "node-cron";

// Import poems model
import poems from "../models/poems.js"; // Path to poems model

// Function that deletes poems with expired deleteDate
async function deleteExpiredPoemsCollections() {
  try {
    const now = new Date(); // Get the current date
    console.log(`Running delete job at: ${now}`); // Log when the job runs
    const result = await poems.deleteMany(
      // Delete all records where deleteDate is less than or equal to the current date
      { deleteDate: { $lte: now } } // Make sure to delete only expired poems
    );
    console.log(`Deleted expired lots. Count: ${result.deletedCount}`);
  } catch (error) {
    console.error("Error deleting expired lots:", error);
  }
}

// Cron job that will run the deleteExpiredPoemsCollections function on a schedule
const poemsCollectionDeleteCronJob = cron.schedule(
  "0 0 * * *", // Run every day at midnight
  deleteExpiredPoemsCollections,
  {
    scheduled: false, // This prevents automatic execution on import
  }
);

// Export the cron job for use in other files
export { poemsCollectionDeleteCronJob };
// */1 * * * *
// │   │ │ │ │
// │   │ │ │ └── Day of the week (0 - 7) (0 or 7 is Sunday, or use names)
// │   │ │ └───── Month (1 - 12)
// │   │ └──────── Day of the month (1 - 31)
// │   └─────────── Hour (0 - 23)
// └──────────────── Minute (0 - 59)
// In this example, the cron job is set to run every minute:

// 0 minutes
// 0 hours
// * any month
// * any day of the month
// * any day of the week
// If you want to change the frequency, you would need to change these values. For example:

// */10 * * * * - every 10 minutes
// 0 */2 * * * - every 2 hours (at the beginning of the hour)
// 0 12 * * MON-FRI - every day at 12:00 PM (noon) from Monday to Friday
