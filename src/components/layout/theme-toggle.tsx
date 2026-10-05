import { MoonIcon, SunIcon } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { useTheme } from '@/components/layout/theme-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const subscribeToMount = () => () => {};
const getMountedSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const mounted = useSyncExternalStore(subscribeToMount, getMountedSnapshot, getServerSnapshot);

  if (!mounted) {
    // Return a placeholder during SSR to avoid hydration mismatch
    return (
      <Button variant="ghost" size="icon">
        <SunIcon className="size-5!" />
        <span className="sr-only">Changer de thème</span>
      </Button>
    );
  }

  return <ThemeToggleContent />;
}

function ThemeToggleContent() {
  const { setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <SunIcon className="size-5! rotate-0 dark:-rotate-90 scale-100 dark:scale-0 transition-all" />
        <MoonIcon className="absolute size-5! rotate-90 dark:rotate-0 scale-0 dark:scale-100 transition-all" />
        <span className="sr-only">Changer de thème</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Clair</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Sombre</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
