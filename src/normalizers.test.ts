import {
  normalizeBluetoothStatus,
  normalizePermissionsResult,
  normalizeReadOriginProgressPayload,
} from './normalizers';

describe('normalizePermissionsResult', () => {
  it('normalizes legacy string payloads', () => {
    expect(normalizePermissionsResult('granted')).toEqual({
      granted: true,
      status: 'granted',
      canAskAgain: false,
    });

    expect(normalizePermissionsResult('denied')).toEqual({
      granted: false,
      status: 'denied',
      canAskAgain: true,
    });
  });

  it('preserves structured payloads', () => {
    expect(
      normalizePermissionsResult({
        granted: false,
        status: 'never_ask_again',
        canAskAgain: false,
      })
    ).toEqual({
      granted: false,
      status: 'never_ask_again',
      canAskAgain: false,
    });
  });
});

describe('normalizeBluetoothStatus', () => {
  it('normalizes numeric iOS payloads into typed strings', () => {
    expect(
      normalizeBluetoothStatus({
        state: 5,
        authorization: 3,
        isScanning: true,
        pendingScanStart: false,
      })
    ).toEqual({
      state: 'poweredOn',
      stateName: 'poweredOn',
      authorization: 'allowedAlways',
      authorizationName: 'allowedAlways',
      isScanning: true,
      pendingScanStart: false,
    });
  });
});

describe('normalizeReadOriginProgressPayload', () => {
  it('converts progress to an integer percentage', () => {
    expect(
      normalizeReadOriginProgressPayload({
        deviceId: 'd1',
        progress: {
          readState: 'reading',
          totalDays: 3,
          currentDay: 2,
          progress: 0.6789,
        },
      })
    ).toEqual({
      deviceId: 'd1',
      progress: {
        readState: 'reading',
        totalDays: 3,
        currentDay: 2,
        progress: 67,
      },
    });
  });

  it('clamps final progress to 100', () => {
    expect(
      normalizeReadOriginProgressPayload({
        deviceId: 'd1',
        progress: {
          readState: 'complete',
          totalDays: 1,
          currentDay: 1,
          progress: 1.2,
        },
      })
    ).toEqual({
      deviceId: 'd1',
      progress: {
        readState: 'complete',
        totalDays: 1,
        currentDay: 1,
        progress: 100,
      },
    });
  });
});
