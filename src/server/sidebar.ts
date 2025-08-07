import { createServerFn } from '@tanstack/react-start';
import { getCookie } from '@tanstack/react-start/server';
import { SIDEBAR_COOKIE_NAME } from '@/components/ui/sidebar';

export const getSideBarStateServerFn = createServerFn().handler(async () => {
  return (getCookie(SIDEBAR_COOKIE_NAME) || false) === 'true';
});
