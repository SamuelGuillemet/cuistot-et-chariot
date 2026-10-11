import { test, expect } from 'vite-plus/test';
import { compareFooterItems } from '../src/components/layout/footer-order.ts';

test('orders footer items by ascending order, then by id', () => {
  const items = [
    { id: 'b', order: 10 },
    { id: 'a', order: 100 },
    { id: 'c', order: 10 },
    { id: 'd', order: 0 },
  ];
  expect([...items].sort(compareFooterItems).map(({ id }) => id)).toEqual(['d', 'b', 'c', 'a']);
});

test('treats identical keys as equal', () => {
  expect(compareFooterItems({ id: 'x', order: 1 }, { id: 'x', order: 1 })).toBe(0);
});
