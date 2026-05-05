import {
  isRecord,
  clamp,
  toNumber,
  toInt,
  toBoolean,
  toStringValue,
  normalizeFunctionStatus,
  normalizeTestState,
} from '@/normalizers/primitives';

describe('isRecord', () => {
  it('returns true for plain objects', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ a: 1 })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isRecord(null)).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isRecord(42)).toBe(false);
    expect(isRecord('str')).toBe(false);
    expect(isRecord(true)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
  });

  it('returns true for arrays (they are objects)', () => {
    expect(isRecord([])).toBe(true);
  });
});

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns min when min equals max', () => {
    expect(clamp(50, 5, 5)).toBe(5);
  });
});

describe('toNumber', () => {
  it('returns finite numbers as-is', () => {
    expect(toNumber(42)).toBe(42);
    expect(toNumber(3.14)).toBe(3.14);
    expect(toNumber(0)).toBe(0);
    expect(toNumber(-7)).toBe(-7);
  });

  it('returns undefined for non-finite numbers', () => {
    expect(toNumber(Infinity)).toBeUndefined();
    expect(toNumber(NaN)).toBeUndefined();
  });

  it('parses numeric strings', () => {
    expect(toNumber('42')).toBe(42);
    expect(toNumber('3.14')).toBe(3.14);
    expect(toNumber('-5')).toBe(-5);
  });

  it('returns undefined for non-numeric strings', () => {
    expect(toNumber('abc')).toBeUndefined();
  });

  it('returns 0 for empty string (Number("") === 0)', () => {
    expect(toNumber('')).toBe(0);
  });

  it('returns undefined for non-string non-number values', () => {
    expect(toNumber(null)).toBeUndefined();
    expect(toNumber(true)).toBeUndefined();
    expect(toNumber({})).toBeUndefined();
  });
});

describe('toInt', () => {
  it('truncates floating-point numbers', () => {
    expect(toInt(3.9)).toBe(3);
    expect(toInt(-2.1)).toBe(-2);
  });

  it('returns fallback when value cannot be parsed', () => {
    expect(toInt(null)).toBe(0);
    expect(toInt(undefined)).toBe(0);
    expect(toInt('abc')).toBe(0);
  });

  it('uses custom fallback', () => {
    expect(toInt(undefined, 99)).toBe(99);
    expect(toInt('bad', -1)).toBe(-1);
  });

  it('parses integer strings', () => {
    expect(toInt('7')).toBe(7);
  });
});

describe('toBoolean', () => {
  it('returns boolean values directly', () => {
    expect(toBoolean(true)).toBe(true);
    expect(toBoolean(false)).toBe(false);
  });

  it('converts non-zero numbers to true', () => {
    expect(toBoolean(1)).toBe(true);
    expect(toBoolean(-1)).toBe(true);
    expect(toBoolean(42)).toBe(true);
  });

  it('converts zero to false', () => {
    expect(toBoolean(0)).toBe(false);
  });

  it('converts truthy strings to true', () => {
    expect(toBoolean('true')).toBe(true);
    expect(toBoolean('1')).toBe(true);
    expect(toBoolean('yes')).toBe(true);
    expect(toBoolean('open')).toBe(true);
    expect(toBoolean('support')).toBe(true);
    expect(toBoolean('supported')).toBe(true);
    expect(toBoolean('TRUE')).toBe(true);
  });

  it('converts falsy strings to false', () => {
    expect(toBoolean('false')).toBe(false);
    expect(toBoolean('0')).toBe(false);
    expect(toBoolean('no')).toBe(false);
    expect(toBoolean('close')).toBe(false);
    expect(toBoolean('unsupported')).toBe(false);
    expect(toBoolean('FALSE')).toBe(false);
  });

  it('returns fallback for unrecognized string', () => {
    expect(toBoolean('maybe', false)).toBe(false);
    expect(toBoolean('maybe', true)).toBe(true);
  });

  it('returns fallback for null/undefined', () => {
    expect(toBoolean(null)).toBe(false);
    expect(toBoolean(undefined, true)).toBe(true);
  });
});

describe('toStringValue', () => {
  it('returns string values directly', () => {
    expect(toStringValue('hello')).toBe('hello');
    expect(toStringValue('')).toBe('');
  });

  it('converts numbers to string', () => {
    expect(toStringValue(42)).toBe('42');
    expect(toStringValue(3.14)).toBe('3.14');
    expect(toStringValue(0)).toBe('0');
  });

  it('converts booleans to string', () => {
    expect(toStringValue(true)).toBe('true');
    expect(toStringValue(false)).toBe('false');
  });

  it('returns fallback for non-string non-number non-boolean', () => {
    expect(toStringValue(null)).toBe('');
    expect(toStringValue(undefined)).toBe('');
    expect(toStringValue({})).toBe('');
    expect(toStringValue(null, 'default')).toBe('default');
  });
});

describe('normalizeFunctionStatus', () => {
  it('maps true to support', () => {
    expect(normalizeFunctionStatus(true)).toBe('support');
  });

  it('maps false to unsupported', () => {
    expect(normalizeFunctionStatus(false)).toBe('unsupported');
  });

  it('maps numeric 0 to unsupported', () => {
    expect(normalizeFunctionStatus(0)).toBe('unsupported');
  });

  it('maps numeric 1 to support', () => {
    expect(normalizeFunctionStatus(1)).toBe('support');
  });

  it('maps numeric 2 to open', () => {
    expect(normalizeFunctionStatus(2)).toBe('open');
  });

  it('maps numeric 3 to close', () => {
    expect(normalizeFunctionStatus(3)).toBe('close');
  });

  it('maps positive numbers above 3 to support', () => {
    expect(normalizeFunctionStatus(5)).toBe('support');
    expect(normalizeFunctionStatus(99)).toBe('support');
  });

  it('maps negative numbers to unsupported', () => {
    expect(normalizeFunctionStatus(-1)).toBe('unsupported');
  });

  it('maps "close" string to close', () => {
    expect(normalizeFunctionStatus('close')).toBe('close');
    expect(normalizeFunctionStatus('closed')).toBe('close');
    expect(normalizeFunctionStatus('support_close')).toBe('close');
    expect(normalizeFunctionStatus('SUPPORT_CLOSE')).toBe('close');
  });

  it('maps "open" string to open', () => {
    expect(normalizeFunctionStatus('open')).toBe('open');
    expect(normalizeFunctionStatus('opened')).toBe('open');
    expect(normalizeFunctionStatus('support_open')).toBe('open');
  });

  it('maps "unsupport..." string to unsupported', () => {
    expect(normalizeFunctionStatus('unsupported')).toBe('unsupported');
    expect(normalizeFunctionStatus('unsupport')).toBe('unsupported');
    expect(normalizeFunctionStatus('0')).toBe('unsupported');
  });

  it('maps "support" / "1" / "true" string to support', () => {
    expect(normalizeFunctionStatus('support')).toBe('support');
    expect(normalizeFunctionStatus('1')).toBe('support');
    expect(normalizeFunctionStatus('true')).toBe('support');
  });

  it('returns unknown for unrecognized strings', () => {
    expect(normalizeFunctionStatus('maybe')).toBe('unknown');
    expect(normalizeFunctionStatus('')).toBe('unknown');
  });

  it('returns unknown for non-string non-number non-boolean', () => {
    expect(normalizeFunctionStatus(null)).toBe('unknown');
    expect(normalizeFunctionStatus(undefined)).toBe('unknown');
    expect(normalizeFunctionStatus({})).toBe('unknown');
  });
});

describe('normalizeTestState', () => {
  describe('string inputs', () => {
    it('maps idle / free to idle', () => {
      expect(normalizeTestState('idle')).toBe('idle');
      expect(normalizeTestState('IDLE_STATE')).toBe('idle');
      expect(normalizeTestState('free')).toBe('idle');
    });

    it('maps start / open to start', () => {
      expect(normalizeTestState('start')).toBe('start');
      expect(normalizeTestState('START')).toBe('start');
      expect(normalizeTestState('open')).toBe('start');
      expect(normalizeTestState('opened')).toBe('start');
    });

    it('maps testing / detect / progress / calibration to testing', () => {
      expect(normalizeTestState('testing')).toBe('testing');
      expect(normalizeTestState('detecting')).toBe('testing');
      expect(normalizeTestState('in_progress')).toBe('testing');
      expect(normalizeTestState('calibration')).toBe('testing');
    });

    it('maps wear* to not_wear', () => {
      expect(normalizeTestState('not_wearing')).toBe('not_wear');
      expect(normalizeTestState('wear')).toBe('not_wear');
      expect(normalizeTestState('WEAR_STATUS')).toBe('not_wear');
    });

    it('maps busy to device_busy', () => {
      expect(normalizeTestState('busy')).toBe('device_busy');
      expect(normalizeTestState('device_busy')).toBe('device_busy');
    });

    it('maps over / complete / close / stop to over', () => {
      expect(normalizeTestState('over')).toBe('over');
      expect(normalizeTestState('complete')).toBe('over');
      expect(normalizeTestState('completed')).toBe('over');
      expect(normalizeTestState('close')).toBe('over');
      expect(normalizeTestState('stop')).toBe('over');
      expect(normalizeTestState('stopped')).toBe('over');
    });

    it('maps error / fail / unsupported / invalid / power to error', () => {
      expect(normalizeTestState('error')).toBe('error');
      expect(normalizeTestState('failed')).toBe('error');
      expect(normalizeTestState('unsupported')).toBe('error');
      expect(normalizeTestState('invalid')).toBe('error');
      expect(normalizeTestState('low_power')).toBe('error');
    });

    it('returns error for unrecognized strings', () => {
      expect(normalizeTestState('xyz')).toBe('error');
    });
  });

  describe('numeric inputs', () => {
    it('maps 0 to start', () => {
      expect(normalizeTestState(0)).toBe('start');
    });

    it('maps 1 to testing', () => {
      expect(normalizeTestState(1)).toBe('testing');
    });

    it('maps 2 to not_wear', () => {
      expect(normalizeTestState(2)).toBe('not_wear');
    });

    it('maps 3 to device_busy', () => {
      expect(normalizeTestState(3)).toBe('device_busy');
    });

    it('maps 4 to over', () => {
      expect(normalizeTestState(4)).toBe('over');
    });

    it('maps other numbers to error', () => {
      expect(normalizeTestState(5)).toBe('error');
      expect(normalizeTestState(-1)).toBe('error');
      expect(normalizeTestState(99)).toBe('error');
    });
  });

  it('returns error for non-string non-number inputs', () => {
    expect(normalizeTestState(null)).toBe('error');
    expect(normalizeTestState(undefined)).toBe('error');
    expect(normalizeTestState({})).toBe('error');
  });
});
