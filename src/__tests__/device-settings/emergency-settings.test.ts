jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { ContactsCapability } from '@/capabilities/contacts/index';
import { SosCapability } from '@/capabilities/sos/index';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('EmergencySettings (split capabilities)', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let contacts: ContactsCapability;
  let sos: SosCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    const ctx = runtime.createCapabilityContext();
    contacts = new ContactsCapability(ctx);
    sos = new SosCapability(ctx);
  });

  // ── readContacts ──────────────────────────────────────────────────────────

  it('readContacts delegates to native and emits contactsData via emitLocal', async () => {
    const emitSpy = jest.spyOn(runtime, 'emitLocal');

    const result = await contacts.readContacts();

    expect(native.readContacts).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
    expect(emitSpy).toHaveBeenCalledWith(
      'contacts_data',
      expect.objectContaining({ contacts: [] }),
    );
  });

  // ── addContact ────────────────────────────────────────────────────────────

  it('addContact delegates to native (happy path)', async () => {
    const contact = { name: 'Alice', phone_number: '1234567890' };

    await contacts.addContact(contact);

    expect(native.addContact).toHaveBeenCalledWith({ name: 'Alice', phoneNumber: '1234567890' });
  });

  // ── deleteContact ─────────────────────────────────────────────────────────

  it('deleteContact(1) delegates to native (happy path)', async () => {
    await contacts.deleteContact(1);

    expect(native.deleteContact).toHaveBeenCalledWith(1);
  });

  // ── setContactSosState ────────────────────────────────────────────────────

  it('setContactSosState delegates to native (happy path)', async () => {
    await contacts.setContactSosState(2, true);

    expect(native.setContactSosState).toHaveBeenCalledWith(2, true);
  });

  // ── readSosCallTimes ──────────────────────────────────────────────────────

  it('readSosCallTimes delegates to native and emits sosCallTimesData via emitLocal', async () => {
    const emitSpy = jest.spyOn(runtime, 'emitLocal');

    const result = await sos.readSosCallTimes();

    expect(native.readSosCallTimes).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ times: 3, min_times: 1, max_times: 9 });
    expect(emitSpy).toHaveBeenCalledWith(
      'sos_call_times_data',
      expect.objectContaining({ data: expect.objectContaining({ times: 3, min_times: 1, max_times: 9 }) }),
    );
  });

  // ── setSosCallTimes ───────────────────────────────────────────────────────

  it('setSosCallTimes(3) delegates to native (happy path)', async () => {
    await sos.setSosCallTimes(3);

    expect(native.setSosCallTimes).toHaveBeenCalledWith(3);
  });

  // ── deleteContact validation ──────────────────────────────────────────────

  it('deleteContact(-1) throws INVALID_ARGUMENT', async () => {
    await expect(contacts.deleteContact(-1)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.deleteContact).not.toHaveBeenCalled();
  });

  // ── setSosCallTimes validation ────────────────────────────────────────────

  it('setSosCallTimes(0) throws INVALID_ARGUMENT', async () => {
    await expect(sos.setSosCallTimes(0)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setSosCallTimes).not.toHaveBeenCalled();
  });
});
