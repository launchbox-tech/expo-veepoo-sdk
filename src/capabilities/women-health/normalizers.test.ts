import { normalizeWomenHealthSettings } from './normalizers';

describe('normalizeWomenHealthSettings', () => {
  it('maps vendor aliases and optional fields', () => {
    const r = normalizeWomenHealthSettings({
      status: 'MENES',
      menstrualLengthDays: 5,
      menstrualCycleDays: 28,
      lastMenstrualDate: '2026-04-01',
      expectedDeliveryDate: '2026-12-01',
      babyBirthday: '2025-06-15',
      babySex: 'man',
      currentMenstrualDays: 3,
      operationStatus: 'READ_SUCCESS',
    });
    expect(r.status).toBe('menstrual');
    expect(r.menstrual_length_days).toBe(5);
    expect(r.menstrual_cycle_days).toBe(28);
    expect(r.last_menstrual_date).toBe('2026-04-01');
    expect(r.expected_delivery_date).toBe('2026-12-01');
    expect(r.baby_birthday).toBe('2025-06-15');
    expect(r.baby_sex).toBe('male');
    expect(r.current_menstrual_days).toBe(3);
    expect(r.operation_status).toBe('READ_SUCCESS');
  });

  it('defaults unknown status to none', () => {
    const r = normalizeWomenHealthSettings({ status: 'weird' });
    expect(r.status).toBe('none');
  });
});
