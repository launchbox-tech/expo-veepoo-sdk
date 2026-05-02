import { readFileSync } from "fs";
import { join } from "path";

import { extractNativeRejectCodes } from "./extract-native-reject-codes.js";

export interface NativeRejectionMappingJson {
  description?: string;
  allowedNativeRejectCodes: string[];
  mapping: {
    directPublicCodes: string[];
    aliasToPublic: Record<
      string,
      { code: string; emitNativeCode?: boolean }
    >;
    collapseToOperationFailed: string[];
    collapseToInvalidArgument: string[];
  };
}

export function loadNativeRejectionContract(repoRoot: string): NativeRejectionMappingJson {
  const p = join(repoRoot, "bridge-contract", "native-rejection-codes.json");
  const data = JSON.parse(
    readFileSync(p, "utf8"),
  ) as NativeRejectionMappingJson;
  if (!Array.isArray(data.allowedNativeRejectCodes) || !data.mapping) {
    throw new Error("bridge-contract/native-rejection-codes.json: invalid shape");
  }
  return data;
}

export function verifyNativeRejectionContract(repoRoot: string): string[] {
  const errors: string[] = [];
  let contract: NativeRejectionMappingJson;
  try {
    contract = loadNativeRejectionContract(repoRoot);
  } catch (e) {
    return [String(e)];
  }

  const extracted = extractNativeRejectCodes(repoRoot);
  const allowed = new Set(contract.allowedNativeRejectCodes);
  if (extracted.size !== allowed.size) {
    errors.push(
      `Native reject code count: extracted ${extracted.size} vs contract ${allowed.size}`,
    );
  }
  for (const c of extracted) {
    if (!allowed.has(c)) {
      errors.push(
        `Native sources emit "${c}" but it is not in allowedNativeRejectCodes — add to bridge-contract/native-rejection-codes.json`,
      );
    }
  }
  for (const c of allowed) {
    if (!extracted.has(c)) {
      errors.push(
        `allowedNativeRejectCodes includes "${c}" but no .reject("…") found — remove stale entry or restore native call`,
      );
    }
  }

  const m = contract.mapping;
  for (const x of m.collapseToOperationFailed) {
    if (m.directPublicCodes.includes(x)) {
      errors.push(
        `Invalid contract: "${x}" is both directPublicCodes and collapseToOperationFailed`,
      );
    }
  }
  for (const x of m.collapseToInvalidArgument) {
    if (m.directPublicCodes.includes(x)) {
      errors.push(
        `Invalid contract: "${x}" is both directPublicCodes and collapseToInvalidArgument`,
      );
    }
  }
  for (const k of Object.keys(m.aliasToPublic)) {
    if (m.directPublicCodes.includes(k)) {
      errors.push(
        `Invalid contract: alias key "${k}" is also in directPublicCodes`,
      );
    }
  }

  return errors;
}
