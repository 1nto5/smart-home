import { test, expect, describe } from 'bun:test';
import { translateDeviceName, translateRoom, translateName } from '../utils/translations';

describe('translateDeviceName', () => {
  test('translates exact Polish device names', () => {
    expect(translateDeviceName('Salon')).toBe('Living Room');
    expect(translateDeviceName('Kuchnia')).toBe('Kitchen');
    expect(translateDeviceName('Sypialnia')).toBe('Bedroom');
    expect(translateDeviceName('Łazienka')).toBe('Bathroom');
  });

  test('is case-insensitive for exact matches', () => {
    expect(translateDeviceName('salon')).toBe('Living Room');
    expect(translateDeviceName('SALON')).toBe('Living Room');
    expect(translateDeviceName('Korytarz 1')).toBe('Hallway 1');
  });

  test('translates sensor names', () => {
    expect(translateDeviceName('Czujnik zalania kuchnia')).toBe('Kitchen Sensor');
    expect(translateDeviceName('Stacja meteo')).toBe('Weather Station');
    expect(translateDeviceName('Drzwi wejściowe')).toBe('Front Door');
  });

  test('translates heater names', () => {
    expect(translateDeviceName('Grzejnik salon')).toBe('Radiator Living Room');
    expect(translateDeviceName('Grzejnik sypialnia')).toBe('Radiator Bedroom');
  });

  test('does word-by-word replacement for partial matches', () => {
    const result = translateDeviceName('Lampa salon duży');
    expect(result).toContain('Light');
    expect(result).toContain('Living Room');
    expect(result).toContain('Large');
  });

  test('returns original name if no translation found', () => {
    expect(translateDeviceName('Unknown Device')).toBe('Unknown Device');
  });

  test('handles empty string', () => {
    expect(translateDeviceName('')).toBe('');
  });
});

describe('translateRoom', () => {
  test('translates Polish room names', () => {
    expect(translateRoom('Salon')).toBe('Living Room');
    expect(translateRoom('Sypialnia')).toBe('Bedroom');
    expect(translateRoom('Kuchnia')).toBe('Kitchen');
    expect(translateRoom('Łazienka')).toBe('Bathroom');
    expect(translateRoom('Korytarz')).toBe('Hallway');
  });

  test('returns Unassigned for null', () => {
    expect(translateRoom(null)).toBe('Unassigned');
  });

  test('returns original name for unknown rooms', () => {
    expect(translateRoom('Custom Room')).toBe('Custom Room');
  });
});

describe('translateName', () => {
  test('translates simple Polish words', () => {
    expect(translateName('drzwi')).toBe('Door');
    expect(translateName('kuchnia')).toBe('Kitchen');
  });

  test('is case-insensitive', () => {
    expect(translateName('Drzwi')).toBe('Door');
  });

  test('falls back to translateDeviceName for unknown words', () => {
    expect(translateName('Grzejnik salon')).toBe('Radiator Living Room');
  });
});
