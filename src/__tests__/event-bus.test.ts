import { EventBus } from '@/bridge/event-bus';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  describe('on / emit', () => {
    it('listener registered with on receives the emitted payload', () => {
      const listener = jest.fn();
      bus.on('device_found', listener);
      bus.emit('device_found', { deviceId: 'abc' });
      expect(listener).toHaveBeenCalledWith({ deviceId: 'abc' });
    });

    it('multiple listeners on the same event all receive the payload', () => {
      const a = jest.fn();
      const b = jest.fn();
      bus.on('device_found', a);
      bus.on('device_found', b);
      bus.emit('device_found', { deviceId: 'x' });
      expect(a).toHaveBeenCalledWith({ deviceId: 'x' });
      expect(b).toHaveBeenCalledWith({ deviceId: 'x' });
    });

    it('listeners on different events do not cross-fire', () => {
      const onFound = jest.fn();
      const onConnected = jest.fn();
      bus.on('device_found', onFound);
      bus.on('device_connected', onConnected);
      bus.emit('device_found', { deviceId: 'abc' });
      expect(onFound).toHaveBeenCalledTimes(1);
      expect(onConnected).not.toHaveBeenCalled();
    });

    it('emit with no registered listeners does not throw', () => {
      expect(() => bus.emit('device_found', {})).not.toThrow();
    });
  });

  describe('off', () => {
    it('off prevents the listener from receiving further events', () => {
      const listener = jest.fn();
      bus.on('device_found', listener);
      bus.off('device_found', listener);
      bus.emit('device_found', { deviceId: 'abc' });
      expect(listener).not.toHaveBeenCalled();
    });

    it('off only removes the specified listener, leaving others intact', () => {
      const a = jest.fn();
      const b = jest.fn();
      bus.on('device_found', a);
      bus.on('device_found', b);
      bus.off('device_found', a);
      bus.emit('device_found', { deviceId: 'x' });
      expect(a).not.toHaveBeenCalled();
      expect(b).toHaveBeenCalledTimes(1);
    });

    it('off on an unregistered listener does not throw', () => {
      const listener = jest.fn();
      expect(() => bus.off('device_found', listener)).not.toThrow();
    });
  });

  describe('once', () => {
    it('once listener fires exactly once then is removed', () => {
      const listener = jest.fn();
      bus.once('device_found', listener);
      bus.emit('device_found', { deviceId: '1' });
      bus.emit('device_found', { deviceId: '2' });
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({ deviceId: '1' });
    });

    it('once listener receives the correct payload', () => {
      const listener = jest.fn();
      bus.once('battery_data', listener);
      bus.emit('battery_data', { level: 80 });
      expect(listener).toHaveBeenCalledWith({ level: 80 });
    });
  });

  describe('removeAllListeners', () => {
    it('removeAllListeners() with no argument clears all events', () => {
      const onFound = jest.fn();
      const onConnected = jest.fn();
      bus.on('device_found', onFound);
      bus.on('device_connected', onConnected);
      bus.removeAllListeners();
      bus.emit('device_found', {});
      bus.emit('device_connected', {});
      expect(onFound).not.toHaveBeenCalled();
      expect(onConnected).not.toHaveBeenCalled();
    });

    it('removeAllListeners(event) clears only that event', () => {
      const onFound = jest.fn();
      const onConnected = jest.fn();
      bus.on('device_found', onFound);
      bus.on('device_connected', onConnected);
      bus.removeAllListeners('device_found');
      bus.emit('device_found', {});
      bus.emit('device_connected', { deviceId: 'abc' });
      expect(onFound).not.toHaveBeenCalled();
      expect(onConnected).toHaveBeenCalledTimes(1);
    });
  });

  describe('error isolation', () => {
    it('a throwing listener does not prevent subsequent listeners from running', () => {
      const throwing = jest.fn().mockImplementation(() => { throw new Error('boom'); });
      const safe = jest.fn();
      bus.on('device_found', throwing);
      bus.on('device_found', safe);
      expect(() => bus.emit('device_found', {})).not.toThrow();
      expect(safe).toHaveBeenCalledTimes(1);
    });

    it('onListenerError callback receives the error, event, and payload', () => {
      const onError = jest.fn();
      const busWithHook = new EventBus(onError);
      const err = new Error('boom');
      busWithHook.on('device_found', () => { throw err; });
      busWithHook.emit('device_found', { deviceId: 'x' });
      expect(onError).toHaveBeenCalledWith(err, 'device_found', { deviceId: 'x' });
    });
  });
});
