import { join } from "path";

import {
  loadNativeRejectionContract,
  verifyNativeRejectionContract,
} from "./verify-native-rejection-contract.js";

const root = join(__dirname, "..", "..");
const errors = verifyNativeRejectionContract(root);
if (errors.length) {
  console.error("Native rejection bridge contract check failed:\n", errors.join("\n"));
  process.exit(1);
}
const c = loadNativeRejectionContract(root);
console.log(
  "Native rejection bridge contract OK (%d observed codes, %d direct mappings).",
  c.allowedNativeRejectCodes.length,
  c.mapping.directPublicCodes.length,
);
