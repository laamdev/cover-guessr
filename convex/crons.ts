import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Sweep abandoned in-progress daily entries once a day. Bounded by the
// internal mutation's batch + self-reschedule, so a backlog catches up
// across multiple transactions instead of timing out.
crons.interval(
  "cleanup abandoned daily entries",
  { hours: 24 },
  internal.daily.cleanupAbandoned,
  {},
);

export default crons;
