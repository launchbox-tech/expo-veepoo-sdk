import type { SocialMsgData } from "@/types/index";
import { normalizeFunctionStatus } from "@/normalizers/primitives";

const supportedFunctionKeys = [
  'phone',
  'sms',
  'wechat',
  'qq',
  'facebook',
  'twitter',
  'instagram',
  'linkedin',
  'whatsapp',
  'line',
  'skype',
  'email',
  'other',
] as const;

export function normalizeSocialMsgData(value: unknown): SocialMsgData {
  const record = (typeof value === 'object' && value !== null) ? value as Record<string, unknown> : {};
  return Object.fromEntries(
    supportedFunctionKeys.map((key) => [key, normalizeFunctionStatus(record[key])])
  ) as unknown as SocialMsgData;
}
