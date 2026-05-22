jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { WomenHealthCapability } from '@/capabilities/women-health/index';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';
import type { WomenHealthSettings } from '@/types/index';

describe('WomenHealthCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let womenHealth: WomenHealthCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    womenHealth = new WomenHealthCapability(runtime.createCapabilityContext());
  });

  it('readWomenHealthSettings delegates to native', async () => {
    native.readWomenHealthSettings.mockResolvedValueOnce({ status: 'none' });

    const result = await womenHealth.readWomenHealthSettings();

    expect(native.readWomenHealthSettings).toHaveBeenCalledTimes(1);
    expect(result.status).toBe('none');
  });

  it('setWomenHealthSettings delegates to native', async () => {
    const settings: WomenHealthSettings = { status: 'none' };

    await womenHealth.setWomenHealthSettings(settings);

    expect(native.setWomenHealthSettings).toHaveBeenCalledWith(settings);
  });

  it.each<{ name: string; settings: WomenHealthSettings }>([
    {
      name: 'menstrual passes with required fields',
      settings: {
        status: 'menstrual',
        last_menstrual_date: '2026-04-01',
        menstrual_length_days: 5,
        menstrual_cycle_days: 28,
      },
    },
    {
      name: 'pregnancy_prep passes with required fields',
      settings: {
        status: 'pregnancy_prep',
        last_menstrual_date: '2026-04-01',
        menstrual_length_days: 5,
        menstrual_cycle_days: 28,
      },
    },
    {
      name: 'pregnancy passes with both dates',
      settings: {
        status: 'pregnancy',
        last_menstrual_date: '2026-01-01',
        expected_delivery_date: '2026-10-01',
      },
    },
    {
      name: 'postpartum passes with all required fields',
      settings: {
        status: 'postpartum',
        last_menstrual_date: '2026-04-01',
        baby_birthday: '2026-03-01',
        menstrual_length_days: 5,
        menstrual_cycle_days: 28,
        baby_sex: 'male',
      },
    },
  ])('setWomenHealthSettings: $name', async ({ settings }) => {
    await expect(womenHealth.setWomenHealthSettings(settings)).resolves.toBeUndefined();
    expect(native.setWomenHealthSettings).toHaveBeenCalled();
  });

  it.each<{ name: string; settings: WomenHealthSettings }>([
    {
      name: 'invalid status',
      settings: { status: 'invalid' as never },
    },
    {
      name: 'menstrual with bad last_menstrual_date format',
      settings: {
        status: 'menstrual',
        last_menstrual_date: '04-01-2026',
        menstrual_length_days: 5,
        menstrual_cycle_days: 28,
      },
    },
    {
      name: 'menstrual with menstrual_length_days out of range',
      settings: {
        status: 'menstrual',
        last_menstrual_date: '2026-04-01',
        menstrual_length_days: 3,
        menstrual_cycle_days: 28,
      },
    },
    {
      name: 'menstrual with menstrual_cycle_days out of range',
      settings: {
        status: 'menstrual',
        last_menstrual_date: '2026-04-01',
        menstrual_length_days: 5,
        menstrual_cycle_days: 14,
      },
    },
    {
      name: 'pregnancy missing expected_delivery_date',
      settings: {
        status: 'pregnancy',
        last_menstrual_date: '2026-04-01',
      },
    },
    {
      name: 'pregnancy missing last_menstrual_date',
      settings: {
        status: 'pregnancy',
        expected_delivery_date: '2026-10-01',
      },
    },
    {
      name: 'pregnancy with bad expected_delivery_date format',
      settings: {
        status: 'pregnancy',
        last_menstrual_date: '2026-04-01',
        expected_delivery_date: '01-2026-12',
      },
    },
    {
      name: 'pregnancy_prep missing menstrual_length_days',
      settings: {
        status: 'pregnancy_prep',
        last_menstrual_date: '2026-04-01',
        menstrual_cycle_days: 28,
      },
    },
    {
      name: 'pregnancy_prep missing menstrual_cycle_days',
      settings: {
        status: 'pregnancy_prep',
        last_menstrual_date: '2026-04-01',
        menstrual_length_days: 5,
      },
    },
    {
      name: 'postpartum with bad baby_birthday format',
      settings: {
        status: 'postpartum',
        last_menstrual_date: '2026-04-01',
        baby_birthday: 'not-a-date',
        menstrual_length_days: 5,
        menstrual_cycle_days: 28,
        baby_sex: 'female',
      },
    },
    {
      name: 'postpartum missing baby_birthday',
      settings: {
        status: 'postpartum',
        last_menstrual_date: '2026-04-01',
        menstrual_length_days: 5,
        menstrual_cycle_days: 28,
        baby_sex: 'female',
      },
    },
    {
      name: 'postpartum missing menstrual_length_days',
      settings: {
        status: 'postpartum',
        last_menstrual_date: '2026-04-01',
        baby_birthday: '2026-03-01',
        menstrual_cycle_days: 28,
        baby_sex: 'female',
      },
    },
    {
      name: 'postpartum missing menstrual_cycle_days',
      settings: {
        status: 'postpartum',
        last_menstrual_date: '2026-04-01',
        baby_birthday: '2026-03-01',
        menstrual_length_days: 5,
        baby_sex: 'female',
      },
    },
    {
      name: 'postpartum missing baby_sex',
      settings: {
        status: 'postpartum',
        last_menstrual_date: '2026-04-01',
        baby_birthday: '2026-03-01',
        menstrual_length_days: 5,
        menstrual_cycle_days: 28,
      },
    },
    {
      name: 'invalid baby_sex',
      settings: { status: 'none', baby_sex: 'unknown' as never },
    },
  ])('setWomenHealthSettings rejects $name → INVALID_ARGUMENT, no native call', async ({ settings }) => {
    await expect(womenHealth.setWomenHealthSettings(settings)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setWomenHealthSettings).not.toHaveBeenCalled();
  });
});
