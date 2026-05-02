import { join } from "node:path";

import { loadContract, verifyVeepooEventsContract } from "./verify-veepoo-events.js";

const root = join(__dirname, "..", "..");
const errors = verifyVeepooEventsContract(root);
if (errors.length) {
  console.error("VeepooEvent bridge contract check failed:\n", errors.join("\n"));
  process.exit(1);
}
const c = loadContract(root);
console.log(
  "VeepooEvent bridge contract OK (%d native + %d jsLocalOnly).",
  c.nativeEmitted.length,
  c.jsLocalOnly.length,
);
