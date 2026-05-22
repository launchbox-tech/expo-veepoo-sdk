import { join } from "path";

import {
  ALLOWED_NATIVE_REJECT_CODES,
  NATIVE_REJECT_MAPPING,
} from "@/errors/native-rejection-mapping";

import { verifyNativeRejectionContract } from "./verify-native-rejection-contract";

const root = join(__dirname, "..", "..");
const errors = verifyNativeRejectionContract(root);
if (errors.length) {
  console.error("Native rejection bridge contract check failed:\n", errors.join("\n"));
  process.exit(1);
}
console.log(
  "Native rejection bridge contract OK (%d observed codes, %d mapping entries).",
  ALLOWED_NATIVE_REJECT_CODES.length,
  Object.keys(NATIVE_REJECT_MAPPING).length,
);
