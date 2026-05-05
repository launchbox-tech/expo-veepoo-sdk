import { EventBus } from '@/bridge/event-bus';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  describe('on / emit', () => {
    it('listener registered with on receives the emitted payload', () => {
      const listener = jest.fn();
      bus.on('deviceFound', listener);
      bus.emit('deviceFound', { deviceId: 'abc' });
      expect(listener).toHaveBeenCalledWith({ deviceId: 'abc' });
    });

    it('multiple listeners on the same event all receive the payload', () => {
      const a = jest.fn();
      const b = jest.fn();
      bus.on('deviceFound', a);
      bus.on('deviceFound', b);
      bus.emit('deviceFound', { deviceId: 'x' });
      expect(a).toHaveBeenCalledWith({ deviceId: 'x' });
      expect(b).toHaveBeenCalledWith({ deviceId: 'x' });
    });

    it('listeners on different events do not cross-fire', () => {
      const onFound = jest.fn();
      const onConnected = jest.fn();
      bus.on('deviceFound', onFound);
      bus.on('deviceConnected', onConnected);
      bus.emit('deviceFound', { deviceId: 'abc' });
      expect(onFound).toHaveBeenCalledTimes(1);
      expect(onConnected).not.toHaveBeenCalled();
    });

    it('emit with no registered listeners does not throw', () => {
      expect(() => bus.emit('deviceFound', {})).not.toThrow();
    });
  });

  describe('off', () => {
    it('off prevents the listener from receiving further events', () => {
      const listener = jest.fn();
      bus.on('deviceFound', listener);
      bus.off('deviceFound', listener);
      bus.emit('deviceFound', { deviceId: 'abc' });
      expect(listener).not.toHaveBeenCalled();
    });

    it('off only removes the specified listener, leaving others intact', () => {
      const a = jest.fn();
      const b = jest.fn();
      bus.on('deviceFound', a);
      bus.on('deviceFound', b);
      bus.off('deviceFound', a);
      bus.emit('deviceFound', { deviceId: 'x' });
      expect(a).not.toHaveBeenCalled();
      expect(b).toHaveBeenCalledTimes(1);
    });

    it('off on an unregistered listener does not throw', () => {
      const listener = jest.fn();
      expect(() => bus.off('deviceFound', listener)).not.toThrow();
    });
  });

  describe('once', () => {
    it('once listener fires exactly once then is removed', () => {
      const listener = jest.fn();
      bus.once('deviceFound', listener);
      bus.emit('deviceFound', { deviceId: '1' });
      bus.emit('deviceFound', { deviceId: '2' });
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({ deviceId: '1' });
    });

    it('once listener receives the correct payload', () => {
      const listener = jest.fn();
      bus.once('batteryData', listener);
      bus.emit('batteryData', { level: 80 });
      expect(listener).toHaveBeenCalledWith({ level: 80 });
    });
  });

  describe('removeAllListeners', () => {
    it('removeAllListeners() with no argument clears all events', () => {
      const onFound = jest.fn();
      const onConnected = jest.fn();
      bus.on('deviceFound', onFound);
      bus.on('deviceConnected', onConnected);
      bus.removeAllListeners();
      bus.emit('deviceFound', {});
      bus.emit('deviceConnected', {});
      expect(onFound).not.toHaveBeenCalled();
      expect(onConnected).not.toHaveBeenCalled();
    });

    it('removeAllListeners(event) clears only that event', () => {
      const onFound = jest.fn();
      const onConnected = jest.fn();
      bus.on('deviceFound', onFound);
      bus.on('deviceConnected', onConnected);
      bus.removeAllListeners('deviceFound');
      bus.emit('deviceFound', {});
      bus.emit('deviceConnected', { deviceId: 'abc' });
      expect(onFound).not.toHaveBeenCalled();
      expect(onConnected).toHaveBeenCalledTimes(1);
    });
  });

  describe('error isolation', () => {
    it('a throwing listener does not prevent subsequent listeners from running', () => {
      const throwing = jest.fn().mockImplementation(() => { throw new Error('boom'); });
      const safe = jest.fn();
      bus.on('deviceFound', throwing);
      bus.on('deviceFound', safe);
      expect(() => bus.emit('deviceFound', {})).not.toThrow();
      expect(safe).toHaveBeenCalledTimes(1);
    });

    it('onListenerError callback receives the error, event, and payload', () => {
      const onError = jest.fn();
      const busWithHook = new EventBus(onError);
      const err = new Error('boom');
      busWithHook.on('deviceFound', () => { throw err; });
      busWithHook.emit('deviceFound', { deviceId: 'x' });
      expect(onError).toHaveBeenCalledWith(err, 'deviceFound', { deviceId: 'x' });
    });
  });
});
