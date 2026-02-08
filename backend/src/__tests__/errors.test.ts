import { test, expect, describe } from 'bun:test';
import { getErrorMessage, hasErrorCode } from '../utils/errors';

describe('getErrorMessage', () => {
  test('extracts message from Error instances', () => {
    expect(getErrorMessage(new Error('something broke'))).toBe('something broke');
  });

  test('extracts message from TypeError', () => {
    expect(getErrorMessage(new TypeError('bad type'))).toBe('bad type');
  });

  test('converts string to string', () => {
    expect(getErrorMessage('plain string error')).toBe('plain string error');
  });

  test('converts number to string', () => {
    expect(getErrorMessage(404)).toBe('404');
  });

  test('converts null to string', () => {
    expect(getErrorMessage(null)).toBe('null');
  });

  test('converts undefined to string', () => {
    expect(getErrorMessage(undefined)).toBe('undefined');
  });

  test('converts object to string', () => {
    expect(getErrorMessage({ code: 'ENOENT' })).toBe('[object Object]');
  });
});

describe('hasErrorCode', () => {
  test('returns true for object with code property', () => {
    expect(hasErrorCode({ code: 'ENOENT' })).toBe(true);
  });

  test('returns true for Error with code', () => {
    const err = Object.assign(new Error('fail'), { code: 'ECONNREFUSED' });
    expect(hasErrorCode(err)).toBe(true);
  });

  test('returns false for plain Error without code', () => {
    expect(hasErrorCode(new Error('no code'))).toBe(false);
  });

  test('returns false for string', () => {
    expect(hasErrorCode('error')).toBe(false);
  });

  test('returns false for null', () => {
    expect(hasErrorCode(null)).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(hasErrorCode(undefined)).toBe(false);
  });

  test('returns false for number', () => {
    expect(hasErrorCode(42)).toBe(false);
  });
});
