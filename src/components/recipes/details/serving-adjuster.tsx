import { MinusIcon, PlusIcon, RotateCcwIcon, UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDecimal } from '@/utils/quantity';

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
    <div className="flex flex-wrap justify-between items-center gap-3 bg-accent/30 p-3 border rounded-lg">
      <div className="flex items-center gap-2 font-medium text-sm">
        <UsersIcon className="w-4 h-4 text-primary" />
        <span>Portions :</span>
        {isModified && (
          <div className="flex items-center gap-1">
            <div className="font-medium text-muted-foreground text-xs text-right">
              ×{formatDecimal(ratio)}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleReset}
              disabled={disabled}
              aria-label="Réinitialiser les portions"
              title="Réinitialiser"
            >
              <RotateCcwIcon className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={disabled || currentServings <= min}
          aria-label="Moins de portions"
        >
          <MinusIcon className="w-4 h-4" />
        </Button>

        <Input
          type="number"
          value={currentServings}
          onChange={handleInputChange}
          disabled={disabled}
          aria-label="Nombre de portions"
          className="w-16 font-semibold text-center"
          min={min}
          max={max}
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={disabled || currentServings >= max}
          aria-label="Plus de portions"
        >
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
