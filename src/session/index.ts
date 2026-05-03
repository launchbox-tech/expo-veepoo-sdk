/**
 * Optional Session baseline helpers.
 *
 * Tree-shakeable: importing from `expo-veepoo-sdk` without touching this
 * sub-path adds zero bytes to the bundle.
 *
 * @packageDocumentation
 */
export {
  runSessionBaseline,
  attachSessionBaseline,
} from './session-baseline.js';

export type {
  SessionBaselineConfig,
  SessionBaselineResult,
  AttachSessionBaselineConfig,
  SessionBaselineHandle,
} from './session-baseline.js';
