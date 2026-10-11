import { test, expect } from 'vite-plus/test';
import { formatDecimal, formatScaledQuantity, formatUnit } from '../src/utils/quantity';

test('rounds scaled quantities to measurable amounts', () => {
  expect(formatScaledQuantity(312.5, 'g')).toBe('313');
  expect(formatScaledQuantity(37.5, 'ml')).toBe('38');
  expect(formatScaledQuantity(2.5, 'pieces')).toBe('2½');
  expect(formatScaledQuantity(0.5, 'tablespoon')).toBe('½');
  expect(formatScaledQuantity(3, 'pieces')).toBe('3');
  expect(formatScaledQuantity(0.3333, 'kg')).toBe(formatDecimal(0.33));
  expect(formatScaledQuantity(0.05, 'pieces')).toBe(formatDecimal(0.05));
});

test('pluralises unit labels only from two', () => {
  expect(formatUnit('pieces', 1)).toBe('pièce');
  expect(formatUnit('pieces', 1.5)).toBe('pièce');
  expect(formatUnit('pieces', 2)).toBe('pièces');
  expect(formatUnit('g', 200)).toBe('g');
});
