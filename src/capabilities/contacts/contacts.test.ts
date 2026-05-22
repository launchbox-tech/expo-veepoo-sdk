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

  it.each([
    {
      name: 'addContact rejects empty name',
      run: (c: ContactsCapability) => c.addContact({ name: '', phone_number: '123' }),
      nativeMethod: 'addContact' as const,
    },
    {
      name: 'addContact rejects whitespace-only name',
      run: (c: ContactsCapability) => c.addContact({ name: '   ', phone_number: '123' }),
      nativeMethod: 'addContact' as const,
    },
    {
      name: 'addContact rejects name exceeding 20 bytes',
      run: (c: ContactsCapability) => c.addContact({ name: 'A'.repeat(21), phone_number: '123' }),
      nativeMethod: 'addContact' as const,
    },
    {
      name: 'addContact rejects empty phone_number',
      run: (c: ContactsCapability) => c.addContact({ name: 'Alice', phone_number: '' }),
      nativeMethod: 'addContact' as const,
    },
    {
      name: 'addContact rejects phone_number exceeding 20 characters',
      run: (c: ContactsCapability) => c.addContact({ name: 'Alice', phone_number: '1'.repeat(21) }),
      nativeMethod: 'addContact' as const,
    },
    {
      name: 'deleteContact rejects negative id',
      run: (c: ContactsCapability) => c.deleteContact(-1),
      nativeMethod: 'deleteContact' as const,
    },
    {
      name: 'deleteContact rejects non-integer id',
      run: (c: ContactsCapability) => c.deleteContact(1.5),
      nativeMethod: 'deleteContact' as const,
    },
    {
      name: 'setContactSosState rejects negative id',
      run: (c: ContactsCapability) => c.setContactSosState(-1, true),
      nativeMethod: 'setContactSosState' as const,
    },
    {
      name: 'setContactSosState rejects non-integer id',
      run: (c: ContactsCapability) => c.setContactSosState(1.5, true),
      nativeMethod: 'setContactSosState' as const,
    },
  ])('$name → INVALID_ARGUMENT, no native call', async ({ run, nativeMethod }) => {
    await expect(run(contacts)).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(native[nativeMethod]).not.toHaveBeenCalled();
  });
});
