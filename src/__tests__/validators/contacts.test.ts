import { validateContactId, validateNewContact } from '@/capabilities/contacts/validators';
import { expectInvalidArgument } from '@/__tests__/helpers/expect-invalid-argument';

describe('validateNewContact', () => {
  it('passes for a valid contact', () => {
    expect(() => validateNewContact({ name: 'Alice', phone_number: '+1234567890' })).not.toThrow();
  });

  it('passes with isSOS true', () => {
    expect(() => validateNewContact({ name: 'Bob', phone_number: '555-1234', is_sos: true })).not.toThrow();
  });

  it('throws for empty name', () => {
    expectInvalidArgument(() => validateNewContact({ name: '', phone_number: '123' }), 'name');
  });

  it('throws for whitespace-only name', () => {
    expectInvalidArgument(() => validateNewContact({ name: '   ', phone_number: '123' }), 'name');
  });

  it('throws when name exceeds 20 bytes', () => {
    expectInvalidArgument(() => validateNewContact({ name: 'A'.repeat(21), phone_number: '123' }), 'name');
  });

  it('throws for empty phoneNumber', () => {
    expectInvalidArgument(() => validateNewContact({ name: 'Alice', phone_number: '' }), 'phoneNumber');
  });

  it('throws when phoneNumber exceeds 20 characters', () => {
    expectInvalidArgument(() => validateNewContact({ name: 'Alice', phone_number: '1'.repeat(21) }), 'phoneNumber');
  });
});

describe('validateContactId', () => {
  it('passes for zero', () => {
    expect(() => validateContactId(0)).not.toThrow();
  });

  it('passes for a positive integer', () => {
    expect(() => validateContactId(5)).not.toThrow();
  });

  it('throws for negative integer', () => {
    expectInvalidArgument(() => validateContactId(-1), 'contactId');
  });

  it('throws for non-integer', () => {
    expectInvalidArgument(() => validateContactId(1.5), 'contactId');
  });
});
