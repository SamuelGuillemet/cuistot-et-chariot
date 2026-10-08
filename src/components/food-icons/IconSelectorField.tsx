import { SearchIcon } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { FoodIcons } from './icon-food-font-config';
import { getIconClass } from './icon-food-font-config';
import { FoodIconSelector } from './IconSelector';

// Icon Selector Field Component with Dialog
interface IconSelectorControlledProps {
  value?: FoodIcons;
  onChange: (iconId: FoodIcons) => void;
  disabled?: boolean;
  error?: boolean;
  showCategories?: boolean;
  className?: string;
}

export const IconSelectorControlled: React.FC<IconSelectorControlledProps> = ({
  value,
  onChange,
  disabled = false,
  error = false,
  showCategories = true,
  className,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<FoodIcons | undefined>(undefined);

  const handleIconSelect = (icon: FoodIcons | undefined) => {
    setSelectedIcon(icon);
  };

  const handleConfirm = () => {
    if (selectedIcon) {
      onChange(selectedIcon);
      setIsDialogOpen(false);
    }
  };

  const handleCancel = () => {
    setSelectedIcon(undefined);
    setIsDialogOpen(false);
  };

  const onDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedIcon(undefined);
    }
  };

  return (
    <div className={cn('relative', disabled && 'opacity-50 pointer-events-none')}>
      <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
        <DialogTrigger
          render={
            <button
              type="button"
              aria-label="Sélectionner une icône"
              disabled={disabled}
              className={cn(
                'flex items-center gap-3 border rounded-lg h-12 px-3 text-sm transition-colors',
                'hover:bg-primary/10 hover:border-primary/40 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring',
                error && 'border-destructive',
                !value && 'bg-muted',
                className,
              )}
            />
          }
        >
          {value ? (
            <>
              <i className={`${getIconClass(value)} text-3xl text-foreground`} aria-hidden="true" />
              <span className="text-muted-foreground">Changer l&apos;icône</span>
            </>
          ) : (
            <>
              <SearchIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Choisir une icône</span>
            </>
          )}
        </DialogTrigger>
        <DialogContent className="sm:min-w-2xl lg:min-w-4xl">
          <DialogHeader>
            <DialogTitle className="pr-10">Sélectionner une icône</DialogTitle>
          </DialogHeader>
          <FoodIconSelector
            onIconSelect={handleIconSelect}
            selectedIcon={selectedIcon}
            showCategories={showCategories}
            className="shadow-none ring-0 w-full"
          />
          <DialogFooter className="flex-row justify-end">
            <Button variant="outline" onClick={handleCancel} className="flex-1 sm:flex-none">
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedIcon}
              className="flex-1 sm:flex-none"
            >
              Valider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
