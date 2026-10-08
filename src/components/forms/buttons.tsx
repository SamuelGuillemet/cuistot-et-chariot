import { Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/lib/forms';
import { cn } from '@/lib/utils';

export function SubmitButton({
  label = 'Enregistrer',
  loadingLabel = 'En cours...',
  isLoading,
  hidden = false,
  className,
  formId,
}: {
  readonly label?: string;
  readonly loadingLabel?: string;
  readonly isLoading?: boolean;
  readonly hidden?: boolean;
  readonly className?: string;
  readonly formId?: string;
}) {
  return (
    <Button
      type="submit"
      form={formId}
      hidden={hidden}
      disabled={isLoading}
      className={cn('gap-2', className ?? 'flex-1 sm:flex-none')}
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
  );
}

export function ResetButton({
  label = 'Réinitialiser',
  isLoading,
  onReset,
}: {
  readonly label?: string;
  readonly isLoading?: boolean;
  readonly onReset?: () => void;
}) {
  const form = useFormContext();
  return (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading}
      className="shrink-0"
      onClick={(e) => {
        e.preventDefault();
        form.reset();
        onReset?.();
      }}
    >
      {label}
    </Button>
  );
}
