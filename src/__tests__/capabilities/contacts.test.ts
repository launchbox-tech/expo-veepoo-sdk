jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { ContactsCapability } from '@/capabilities/contacts/index';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('ContactsCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let contacts: ContactsCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    contacts = new ContactsCapability(runtime.createCapabilityContext());
  });

  it('readContacts delegates to native and emits contacts_data via emitLocal', async () => {
    const emitSpy = jest.spyOn(runtime, 'emitLocal');

    const result = await contacts.readContacts();

    expect(native.readContacts).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
    expect(emitSpy).toHaveBeenCalledWith(
      'contacts_data',
      expect.objectContaining({ contacts: [] }),
    );
  });

  it('addContact converts snake_case to camelCase for native', async () => {
    await contacts.addContact({ name: 'Alice', phone_number: '1234567890' });

    expect(native.addContact).toHaveBeenCalledWith({ name: 'Alice', phoneNumber: '1234567890' });
  });

  it('deleteContact(1) delegates to native', async () => {
    await contacts.deleteContact(1);

    expect(native.deleteContact).toHaveBeenCalledWith(1);
  });

  it('setContactSosState delegates to native', async () => {
    await contacts.setContactSosState(2, true);

    expect(native.setContactSosState).toHaveBeenCalledWith(2, true);
  });

  it('deleteContact(-1) throws INVALID_ARGUMENT without calling native', async () => {
    await expect(contacts.deleteContact(-1)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.deleteContact).not.toHaveBeenCalled();
  });
});
