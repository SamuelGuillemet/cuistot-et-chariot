import { Link, useRouterState } from '@tanstack/react-router';
import { ChefHatIcon, PackageIcon } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './layout/theme-toggle';
import UserBadge from './layout/user-badge';

export function Layout({ children }: PropsWithChildren) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const recipesActive = pathname.startsWith('/recipes');
  const productsActive = pathname.startsWith('/products');

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="flex h-14 w-full items-center gap-4 px-4 sm:px-12">
          <Link
            to="/recipes"
            className="flex shrink-0 items-center gap-2 font-semibold text-foreground"
          >
            <ChefHatIcon className="size-5 text-primary" />
            <span className="hidden sm:inline">Cuistot et Chariot</span>
          </Link>

          <nav aria-label="Pages principales" className="flex h-full flex-1 items-center gap-1">
            <Link
              to="/recipes"
              aria-current={recipesActive ? 'page' : undefined}
              className={cn(
                'relative flex h-full items-center gap-2 px-3 text-sm font-medium transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-transparent',
                recipesActive
                  ? 'text-foreground after:bg-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <ChefHatIcon className="size-4" />
              Recettes
            </Link>
            <Link
              to="/products"
              aria-current={productsActive ? 'page' : undefined}
              className={cn(
                'relative flex h-full items-center gap-2 px-3 text-sm font-medium transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-transparent',
                productsActive
                  ? 'text-foreground after:bg-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <PackageIcon className="size-4" />
              Produits
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle />
            <UserBadge />
          </div>
        </div>
      </header>
      <main className="w-full flex-1 px-4 py-5 sm:px-12">{children}</main>
    </div>
  );
}
