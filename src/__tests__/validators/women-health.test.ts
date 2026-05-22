import { validateWomenHealthSettings } from '@/capabilities/women-health/validators';
import { expectInvalidArgument } from '@/__tests__/helpers/expect-invalid-argument';

describe('validateWomenHealthSettings', () => {
  it('passes for menstrual with required fields', () => {
    expect(() =>
      validateWomenHealthSettings({
        status: 'menstrual',
        last_menstrual_date: '2026-04-01',
        menstrual_length_days: 5,
        menstrual_cycle_days: 28,
      }),
    ).not.toThrow();
  });

  it('requires expectedDeliveryDate for pregnancy', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'pregnancy',
          last_menstrual_date: '2026-04-01',
        }),
      'expectedDeliveryDate',
    );
  });

  it('throws for bad date format', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'menstrual',
          last_menstrual_date: '04-01-2026',
          menstrual_length_days: 5,
          menstrual_cycle_days: 28,
        }),
      'lastMenstrualDate',
    );
  });

  it('passes for status none', () => {
    expect(() => validateWomenHealthSettings({ status: 'none' })).not.toThrow();
  });

  it('throws for invalid status', () => {
    expectInvalidArgument(() => validateWomenHealthSettings({ status: 'invalid' as any }), 'status');
  });

  it('throws when menstrual_length_days out of range', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'menstrual',
          last_menstrual_date: '2026-04-01',
          menstrual_length_days: 3,
          menstrual_cycle_days: 28,
        }),
      'menstrualLengthDays',
    );
  });

  it('throws when menstrual_cycle_days out of range', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'menstrual',
          last_menstrual_date: '2026-04-01',
          menstrual_length_days: 5,
          menstrual_cycle_days: 14,
        }),
      'menstrualCycleDays',
    );
  });

  it('throws for bad expected_delivery_date format', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'pregnancy',
          last_menstrual_date: '2026-04-01',
          expected_delivery_date: '01-2026-12',
        }),
      'expectedDeliveryDate',
    );
  });

  it('throws for bad baby_birthday format', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'postpartum',
          last_menstrual_date: '2026-04-01',
          baby_birthday: 'not-a-date',
          menstrual_length_days: 5,
          menstrual_cycle_days: 28,
          baby_sex: 'female',
        }),
      'babyBirthday',
    );
  });

  it('throws for invalid baby_sex', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'none',
          baby_sex: 'unknown' as any,
        }),
      'babySex',
    );
  });

  it('passes for pregnancy_prep with required fields', () => {
    expect(() =>
      validateWomenHealthSettings({
        status: 'pregnancy_prep',
        last_menstrual_date: '2026-04-01',
        menstrual_length_days: 5,
        menstrual_cycle_days: 28,
      }),
    ).not.toThrow();
  });

  it('throws for pregnancy_prep missing menstrual_length_days', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'pregnancy_prep',
          last_menstrual_date: '2026-04-01',
          menstrual_cycle_days: 28,
        }),
      'menstrualLengthDays',
    );
  });

  it('throws for pregnancy_prep missing menstrual_cycle_days', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'pregnancy_prep',
          last_menstrual_date: '2026-04-01',
          menstrual_length_days: 5,
        }),
      'menstrualCycleDays',
    );
  });

  it('passes for pregnancy with both dates', () => {
    expect(() =>
      validateWomenHealthSettings({
        status: 'pregnancy',
        last_menstrual_date: '2026-01-01',
        expected_delivery_date: '2026-10-01',
      }),
    ).not.toThrow();
  });

  it('throws for pregnancy missing last_menstrual_date', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'pregnancy',
          expected_delivery_date: '2026-10-01',
        }),
      'lastMenstrualDate',
    );
  });

  it('passes for postpartum with all required fields', () => {
    expect(() =>
      validateWomenHealthSettings({
        status: 'postpartum',
        last_menstrual_date: '2026-04-01',
        baby_birthday: '2026-03-01',
        menstrual_length_days: 5,
        menstrual_cycle_days: 28,
        baby_sex: 'male',
      }),
    ).not.toThrow();
  });

  it('throws for postpartum missing baby_birthday', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'postpartum',
          last_menstrual_date: '2026-04-01',
          menstrual_length_days: 5,
          menstrual_cycle_days: 28,
          baby_sex: 'female',
        }),
      'babyBirthday',
    );
  });

  it('throws for postpartum missing menstrual_length_days', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'postpartum',
          last_menstrual_date: '2026-04-01',
          baby_birthday: '2026-03-01',
          menstrual_cycle_days: 28,
          baby_sex: 'female',
        }),
      'menstrualLengthDays',
    );
  });

  it('throws for postpartum missing menstrual_cycle_days', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'postpartum',
          last_menstrual_date: '2026-04-01',
          baby_birthday: '2026-03-01',
          menstrual_length_days: 5,
          baby_sex: 'female',
        }),
      'menstrualCycleDays',
    );
  });

  it('throws for postpartum missing baby_sex', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'postpartum',
          last_menstrual_date: '2026-04-01',
          baby_birthday: '2026-03-01',
          menstrual_length_days: 5,
          menstrual_cycle_days: 28,
        }),
      'babySex',
    );
  });
});
