import type { FunctionStatus, SocialMsgData } from "../../types/index.js";

const VALID_FUNCTION_STATUSES = new Set<FunctionStatus>([
  'unsupported', 'support', 'open', 'close', 'unknown',
]);

export function validateSocialMsgData(data: Partial<SocialMsgData>): void {
  const keys = Object.keys(data);
  if (keys.length === 0) {
    throw { code: 'INVALID_ARGUMENT', message: 'data must contain at least one channel' };
  }
  for (const key of keys) {
    const value = (data as Record<string, unknown>)[key];
    if (!VALID_FUNCTION_STATUSES.has(value as FunctionStatus)) {
      throw { code: 'INVALID_ARGUMENT', message: `${key} must be a valid FunctionStatus` };
    }
  }
}
