import { normalizeWeatherSettings } from './normalizers';

describe('normalizeWeatherSettings', () => {

  it('normalizes a valid weather settings object', () => {
    const r = normalizeWeatherSettings({ isOpen: true, unit: 'C', crc: 99 });
    expect(r.is_open).toBe(true);
    expect(r.unit).toBe('C');
    expect(r.crc).toBe(99);
  });

  it('normalizes Fahrenheit unit', () => {
    const r = normalizeWeatherSettings({ isOpen: false, unit: 'f', crc: 0 });
    expect(r.unit).toBe('F');
    expect(r.is_open).toBe(false);
  });

  it('defaults to C for unknown unit', () => {
    const r = normalizeWeatherSettings({ isOpen: true, unit: 'X', crc: 0 });
    expect(r.unit).toBe('C');
  });

  it('returns safe defaults for empty object', () => {
    const r = normalizeWeatherSettings({});
    expect(r.is_open).toBe(false);
    expect(r.unit).toBe('C');
    expect(r.crc).toBe(0);
  });

  it('returns safe defaults for non-object input', () => {
    const r = normalizeWeatherSettings(null);
    expect(r.is_open).toBe(false);
    expect(r.unit).toBe('C');
    expect(r.crc).toBe(0);
  });
});
