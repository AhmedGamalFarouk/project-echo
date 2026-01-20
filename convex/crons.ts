import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "soft-wipe",
  { hours: 1 }, // Run every hour
  internal.posts.archiveOldPosts,
  {}
);

export default crons;
