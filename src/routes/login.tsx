import { createFileRoute } from '@tanstack/react-router';
import { Login } from '@/components/auth/login';

type LoginSearch = {
  redirect?: string;
  error?: string;
};

const allowedSearchKeys = ['redirect', 'error'];

export const Route = createFileRoute('/login')({
  component: Login,
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    const searchParams: LoginSearch = {};
    for (const key in search) {
      if (allowedSearchKeys.includes(key)) {
        searchParams[key as keyof LoginSearch] = search[key] as string;
      }
    }
    return searchParams;
  },
});
