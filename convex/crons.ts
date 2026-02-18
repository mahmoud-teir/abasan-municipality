import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run conversation cleanup every day at 3:00 AM UTC
crons.daily(
    "cleanup-old-conversations",
    { hourUTC: 3, minuteUTC: 0 },
    internal.cleanup.cleanupOldConversations,
    { maxAgeDays: 30 } // Delete conversations older than 30 days
);

export default crons;
