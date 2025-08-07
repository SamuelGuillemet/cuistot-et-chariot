import { Outlet } from '@tanstack/react-router';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import Breadcrumbs from './layout/breadcrumbs';
import { AppSidebar } from './layout/sidebar';
import { ThemeToggle } from './layout/theme-toggle';
import UserBadge from './layout/user-badge';
import { SidebarInset, SidebarProvider, SidebarTrigger } from './ui/sidebar';

export function Layout() {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex items-center gap-2 p-4 h-16 shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="hidden md:flex mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumbs />
            </div>
            <div className="ml-auto">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserBadge />
              </div>
            </div>
          </header>
          <div className="flex flex-col items-start gap-4 md:gap-8 p-4 sm:px-6 sm:py-0 grow">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </>
  );
}
