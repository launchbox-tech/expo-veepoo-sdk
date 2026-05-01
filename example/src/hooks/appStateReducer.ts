export type AppState =
  | 'initializing'
  | 'idle'
  | 'scanning'
  | 'connecting'
  | 'ready'
  | 'disconnected';

export type AppAction =
  | { type: 'SDK_READY' }
  | { type: 'SCAN_START' }
  | { type: 'SCAN_STOP' }
  | { type: 'BAND_SELECTED' }
  | { type: 'SESSION_READY' }
  | { type: 'SESSION_ERROR' }
  | { type: 'SESSION_ENDED' }
  | { type: 'DISCONNECT' }
  | { type: 'RECONNECT' };

export function appStateReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SDK_READY':     return 'idle';
    case 'SCAN_START':    return 'scanning';
    case 'SCAN_STOP':     return 'idle';
    case 'BAND_SELECTED': return 'connecting';
    case 'SESSION_READY': return 'ready';
    case 'SESSION_ERROR': return 'disconnected';
    case 'SESSION_ENDED': return 'disconnected';
    case 'DISCONNECT':    return 'idle';
    case 'RECONNECT':     return 'scanning';
    default:              return state;
  }
}
