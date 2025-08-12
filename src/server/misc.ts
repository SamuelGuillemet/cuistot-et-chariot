import { createServerFn } from '@tanstack/react-start';
import { getCookie } from '@tanstack/react-start/server';
import { HOUSEHOLD_COOKIE_NAME } from '@/stores/household';

export const getHouseholdIdServerFn = createServerFn().handler(async () => {
  return getCookie(HOUSEHOLD_COOKIE_NAME);
});
