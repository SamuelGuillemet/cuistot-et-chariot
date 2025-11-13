import { Loader2Icon } from 'lucide-react';
import { useFormContext } from '@/lib/forms';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export function SubmitButton({
  label = 'Enregistrer',
  loadingLabel = 'En cours...',
  isLoading,
  hidden = false,
  className,
}: {
  readonly label?: string;
  readonly loadingLabel?: string;
  readonly isLoading?: boolean;
  readonly hidden?: boolean;
  readonly className?: string;
}) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      <Button
        type="submit"
        hidden={hidden}
        disabled={isLoading}
        className={cn('gap-2', className ?? 'w-full sm:w-auto')}
      >
        {isLoading ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            <span>{loadingLabel}</span>
          </>
        ) : (
          <span>{label}</span>
        )}
      </Button>
    </form.Subscribe>
  );
}

export function ResetButton({
  label = 'Réinitialiser',
  isLoading,
}: {
  readonly label?: string;
  readonly isLoading?: boolean;
}) {
  const form = useFormContext();
  return (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading}
      onClick={(e) => {
        e.preventDefault();
        form.reset();
      }}
    >
      {label}
    </Button>
  );
}
