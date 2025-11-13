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
import { FoodIconSelector } from './IconSelector';
import type { FoodIcons } from './icon-food-font-config';
import { getIconClass } from './icon-food-font-config';

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
  const [selectedIcon, setSelectedIcon] = useState<FoodIcons | undefined>(
    undefined,
  );

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
    <div
      className={cn('relative', disabled && 'opacity-50 pointer-events-none')}
    >
      <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
        <DialogTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex justify-center items-center border rounded-lg w-12 h-12 transition-colors',
              'hover:bg-accent hover:border-primary/20 focus:outline-none focus:ring-2 focus:ring-ring',
              error && 'border-destructive',
              !value && 'bg-muted',
              className,
            )}
          >
            {value ? (
              <i
                className={`${getIconClass(value)} text-2xl text-primary`}
                aria-hidden="true"
              />
            ) : (
              <span className="text-muted-foreground text-xs">
                <SearchIcon className="w-4 h-4" />
              </span>
            )}
          </button>
        </DialogTrigger>
        <DialogContent className="sm:min-w-2xl lg:min-w-4xl">
          <DialogHeader>
            <DialogTitle>Sélectionner une icône</DialogTitle>
          </DialogHeader>
          <FoodIconSelector
            onIconSelect={handleIconSelect}
            selectedIcon={selectedIcon}
            showCategories={showCategories}
            className="shadow-none border-0 w-full"
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedIcon}>
              Valider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
