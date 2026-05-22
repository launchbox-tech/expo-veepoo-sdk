import { wrapInner, type PartialEventNormalizers } from '@/bridge/event-envelope';
import { normalizeContactList } from './normalizers';

export const EVENT_NORMALIZERS = {
  contacts_data: wrapInner('contacts', normalizeContactList, { fallbackKey: 'data' }),
} satisfies PartialEventNormalizers;
