import { FilterIcon, XIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { useMediaQuery } from '@/hooks/use-media-query';

/** Label above a filter control inside the drawer. */
export function FilterField({
  label,
  htmlFor,
  children,
}: {
  readonly label: string;
  readonly htmlFor?: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

interface FiltersDrawerProps {
  readonly activeCount: number;
  readonly resultCount: number;
  readonly onReset: () => void;
  readonly children: ReactNode;
}

export function FiltersDrawer({ activeCount, resultCount, onReset, children }: FiltersDrawerProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <Drawer showSwipeHandle={!isDesktop} swipeDirection={isDesktop ? 'right' : 'down'}>
      <DrawerTrigger render={<Button variant="outline" className="gap-2" />}>
        <FilterIcon className="w-4 h-4" />
        Filtres
        {activeCount > 0 && <Badge variant="secondary">{activeCount}</Badge>}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="pt-2">
          <DrawerTitle>Filtres</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-5 p-4">{children}</div>
        <DrawerFooter className="pb-6">
          <DrawerClose render={<Button />}>
            {resultCount === 0
              ? 'Aucun résultat'
              : `Afficher ${resultCount} résultat${resultCount > 1 ? 's' : ''}`}
          </DrawerClose>
          {activeCount > 0 && (
            <Button variant="ghost" onClick={onReset}>
              <XIcon /> Réinitialiser les filtres
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
