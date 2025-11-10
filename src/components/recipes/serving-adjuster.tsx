import { MinusIcon, PlusIcon, RotateCcwIcon, UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ServingAdjusterProps {
  readonly originalServings: number;
  readonly currentServings: number;
  readonly onServingsChange: (servings: number) => void;
  readonly min?: number;
  readonly max?: number;
  readonly disabled?: boolean;
}

export function ServingAdjuster({
  originalServings,
  currentServings,
  onServingsChange,
  min = 1,
  max = 99,
  disabled = false,
}: ServingAdjusterProps) {
  const ratio = originalServings > 0 ? currentServings / originalServings : 1;
  const isModified = currentServings !== originalServings;

  const handleIncrement = () => {
    if (currentServings < max) {
      onServingsChange(currentServings + 1);
    }
  };

  const handleDecrement = () => {
    if (currentServings > min) {
      onServingsChange(currentServings - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseInt(e.target.value, 10);
    if (!Number.isNaN(newValue) && newValue >= min && newValue <= max) {
      onServingsChange(newValue);
    }
  };

  const handleReset = () => {
    onServingsChange(originalServings);
  };

  return (
    <div className="flex justify-between items-center bg-accent/30 p-3 border rounded-lg">
      <div className="flex items-center gap-2 font-medium text-sm">
        <UsersIcon className="w-4 h-4 text-primary" />
        <span>Portions :</span>
        {isModified && (
          <div className="flex flex-gap-2 items-center">
            <div className="font-medium text-muted-foreground text-xs text-right">
              ×{ratio.toFixed(1)}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={disabled}
              className="px-2 h-8"
              title="Réinitialiser"
            >
              <RotateCcwIcon className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDecrement}
            disabled={disabled || currentServings <= min}
            className="p-0 w-8 h-8"
          >
            <MinusIcon className="w-4 h-4" />
          </Button>

          <Input
            type="number"
            value={currentServings}
            onChange={handleInputChange}
            disabled={disabled}
            className="w-16 h-8 font-semibold text-center"
            min={min}
            max={max}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleIncrement}
            disabled={disabled || currentServings >= max}
            className="p-0 w-8 h-8"
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
