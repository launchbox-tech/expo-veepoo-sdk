import { join } from "node:path";

import { NATIVE_EMITTED_EVENTS, JS_LOCAL_ONLY_EVENTS } from "../bridge/veepoo-events-registry.js";
import { verifyVeepooEventsContract } from "./verify-veepoo-events.js";

const root = join(__dirname, "..", "..");
const errors = verifyVeepooEventsContract(root);
if (errors.length) {
  console.error("VeepooEvent bridge contract check failed:\n", errors.join("\n"));
  process.exit(1);
}
console.log(
  "VeepooEvent bridge contract OK (%d native + %d jsLocalOnly).",
  NATIVE_EMITTED_EVENTS.length,
  JS_LOCAL_ONLY_EVENTS.length,
);
