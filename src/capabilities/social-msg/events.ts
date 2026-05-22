import { wrapInner, type PartialEventNormalizers } from '@/bridge/event-envelope';
import { normalizeSocialMsgData } from './normalizers';

export const EVENT_NORMALIZERS = {
  social_msg_data: wrapInner('data', normalizeSocialMsgData),
} satisfies PartialEventNormalizers;
