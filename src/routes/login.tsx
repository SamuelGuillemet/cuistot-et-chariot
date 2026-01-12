import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { ChefHatIcon } from 'lucide-react';
import { LoginForm } from '@/components/auth/login';

type LoginSearch = {
  redirect?: string;
  error?: string;
};

const allowedSearchKeys = ['redirect', 'error'];

export const Route = createFileRoute('/login')({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    const searchParams: LoginSearch = {};
    for (const key in search) {
      if (allowedSearchKeys.includes(key)) {
        searchParams[key as keyof LoginSearch] =
          typeof search[key] === 'string' ? search[key] : undefined;
      }
    }
    return searchParams;
  },
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
  },
});

function LoginPage() {
  return (
    <div className="flex flex-col justify-center items-center gap-6 bg-muted p-6 md:p-10 min-h-svh">
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <Link to="/" className="flex justify-center items-center gap-3">
          <div className="flex justify-center items-center bg-primary shadow-sm rounded-md w-9 h-9 text-primary-foreground">
            <ChefHatIcon className="w-5 h-5" />
          </div>
          <span className="font-semibold text-primary">Cuistot et Chariot</span>
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
