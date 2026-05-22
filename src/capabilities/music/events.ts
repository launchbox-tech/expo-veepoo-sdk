import { wrapInner, type PartialEventNormalizers } from '@/bridge/event-envelope';
import { normalizeMusicRemoteCommand } from './normalizers';

export const EVENT_NORMALIZERS = {
  music_remote_command: wrapInner('command', normalizeMusicRemoteCommand),
} satisfies PartialEventNormalizers;
