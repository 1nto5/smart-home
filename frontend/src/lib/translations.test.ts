import { describe, it, expect } from 'vitest';
import { translateRoom, translateDeviceName, getSimplifiedName, getRoomIcon, roomTranslations, roomIcons } from './translations';

describe('translateRoom', () => {
  it('translates known Polish room names', () => {
    expect(translateRoom('Salon')).toBe('Living Room');
    expect(translateRoom('Sypialnia')).toBe('Bedroom');
    expect(translateRoom('Kuchnia')).toBe('Kitchen');
    expect(translateRoom('Łazienka')).toBe('Bathroom');
    expect(translateRoom('Korytarz')).toBe('Hallway');
    expect(translateRoom('Biuro')).toBe('Office');
  });

  it('returns "Unassigned" for null', () => {
    expect(translateRoom(null)).toBe('Unassigned');
  });

  it('returns original string for unknown room names', () => {
    expect(translateRoom('Unknown Room')).toBe('Unknown Room');
  });

  it('is case-sensitive (only matches exact keys)', () => {
    expect(translateRoom('salon')).toBe('salon');
    expect(translateRoom('SALON')).toBe('SALON');
  });
});

describe('translateDeviceName', () => {
  it('returns empty string for empty input', () => {
    expect(translateDeviceName('')).toBe('');
  });

  it('translates exact device name matches (case-insensitive)', () => {
    expect(translateDeviceName('korytarz 1')).toBe('Hallway 1');
    expect(translateDeviceName('Korytarz 1')).toBe('Hallway 1');
    expect(translateDeviceName('KUCHNIA')).toBe('Kitchen');
    expect(translateDeviceName('salon')).toBe('Living Room');
    expect(translateDeviceName('Salon')).toBe('Living Room');
  });

  it('translates sensor names', () => {
    expect(translateDeviceName('Czujnik zalania kuchnia')).toBe('Kitchen Sensor');
    expect(translateDeviceName('Czujnik zalania łazienka')).toBe('Bathroom Sensor');
    expect(translateDeviceName('Stacja meteo')).toBe('Weather Station');
    expect(translateDeviceName('Drzwi')).toBe('Door Sensor');
  });

  it('translates thermostat names', () => {
    expect(translateDeviceName('Grzejnik salon')).toBe('Radiator Living Room');
    expect(translateDeviceName('Grzejnik sypialnia')).toBe('Radiator Bedroom');
    expect(translateDeviceName('Grzejnik łazienka')).toBe('Radiator Bathroom');
  });

  it('applies word-by-word replacement for partial matches', () => {
    const result = translateDeviceName('Lampa duży salon');
    expect(result).toContain('Light');
    expect(result).toContain('Large');
    expect(result).toContain('Living Room');
  });

  it('returns original if no translation found', () => {
    expect(translateDeviceName('My Custom Device')).toBe('My Custom Device');
  });
});

describe('getSimplifiedName', () => {
  it('strips Radiator prefix for wkf category', () => {
    expect(getSimplifiedName('Grzejnik salon', 'wkf')).toBe('Living Room');
    expect(getSimplifiedName('Grzejnik sypialnia', 'wkf')).toBe('Bedroom');
  });

  it('extracts room name from sensor for sj category', () => {
    expect(getSimplifiedName('Czujnik zalania kuchnia', 'sj')).toBe('Kitchen');
    expect(getSimplifiedName('Czujnik zalania łazienka', 'sj')).toBe('Bathroom');
  });

  it('extracts location for mcs category', () => {
    expect(getSimplifiedName('Drzwi', 'mcs')).toBe('Door');
  });

  it('returns translated name for other categories', () => {
    expect(getSimplifiedName('salon', 'dj')).toBe('Living Room');
  });
});

describe('getRoomIcon', () => {
  it('returns correct icons for known rooms', () => {
    expect(getRoomIcon('Living Room')).toBe('🛋️');
    expect(getRoomIcon('Bedroom')).toBe('🛏️');
    expect(getRoomIcon('Kitchen')).toBe('🍳');
    expect(getRoomIcon('Bathroom')).toBe('🚿');
  });

  it('returns default house icon for unknown rooms', () => {
    expect(getRoomIcon('Mystery Room')).toBe('🏠');
  });

  it('has icons for all translated rooms', () => {
    const translatedRooms = Object.values(roomTranslations);
    for (const room of translatedRooms) {
      expect(roomIcons[room]).toBeDefined();
    }
  });
});
