import { useBlocker } from '@tanstack/react-router';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/** Asks for confirmation before leaving the page while `when` is true. */
export function UnsavedChangesGuard({ when }: { readonly when: boolean }) {
  const blocker = useBlocker({
    shouldBlockFn: () => true,
    disabled: !when,
    enableBeforeUnload: when,
    withResolver: true,
  });

  return (
    <AlertDialog
      open={blocker.status === 'blocked'}
      onOpenChange={(open) => {
        if (!open) blocker.reset?.();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Changements non enregistrés</AlertDialogTitle>
          <AlertDialogDescription>
            Vous avez des changements non enregistrés. Êtes-vous sûr de vouloir quitter cette page ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={(e) => {
              e.preventDefault();
              blocker.reset?.();
            }}
          >
            Rester
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              blocker.proceed?.();
            }}
          >
            Quitter la page
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
