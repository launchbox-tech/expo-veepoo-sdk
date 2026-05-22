import { normalizeContactList } from './normalizers';

describe('normalizeContactList', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeContactList(null)).toEqual([]);
    expect(normalizeContactList(undefined)).toEqual([]);
    expect(normalizeContactList({})).toEqual([]);
  });

  it('normalizes a standard Android-shaped contact (name + phoneNumber)', () => {
    const raw = [{ contactID: 1, name: 'Alice', phoneNumber: '+1234567890', isSettingSOS: true, isSupportSOS: true }];
    const result = normalizeContactList(raw);
    expect(result).toHaveLength(1);
    expect(result[0].contact_id).toBe(1);
    expect(result[0].name).toBe('Alice');
    expect(result[0].phone_number).toBe('+1234567890');
    expect(result[0].is_sos).toBe(true);
    expect(result[0].is_support_sos).toBe(true);
  });

  it('normalizes an iOS-shaped contact (nickName field)', () => {
    const raw = [{ contactID: 2, nickName: 'Bob', phoneNumber: '555-0100', isSOS: false }];
    const result = normalizeContactList(raw);
    expect(result[0].name).toBe('Bob');
    expect(result[0].is_sos).toBe(false);
    expect(result[0].is_support_sos).toBeUndefined();
  });

  it('drops entries that have no name or phone', () => {
    const raw = [{ contactID: 3 }];
    expect(normalizeContactList(raw)).toHaveLength(0);
  });

  it('handles mixed valid and invalid entries', () => {
    const raw = [
      { contactID: 1, name: 'Alice', phoneNumber: '123' },
      null,
      { contactID: 2, name: 'Bob', phoneNumber: '456' },
    ];
    expect(normalizeContactList(raw)).toHaveLength(2);
  });
});
