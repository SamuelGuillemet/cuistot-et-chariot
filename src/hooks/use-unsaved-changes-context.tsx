import { useBlocker, useRouter } from '@tanstack/react-router';
import * as React from 'react';
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

type UnsavedChangesContextValue = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
};

const UnsavedChangesContext =
  React.createContext<UnsavedChangesContextValue | null>(null);

export function UnsavedChangesProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = React.useState(false);

  // 1. useBlocker with withResolver: true
  const blocker = useBlocker({
    withResolver: true,
    disabled: !enabled,
    enableBeforeUnload: enabled,
    shouldBlockFn: async () => {
      if (!enabled) return false;
      return true;
    },
  });

  const isBlocked = blocker.status === 'blocked';

  const value = React.useMemo(
    () => ({
      enabled,
      setEnabled,
    }),
    [enabled],
  );

  React.useEffect(() => {
    const unsub = router.subscribe('onRendered', () => {
      blocker.reset?.();
      setEnabled(false);
    });
    return () => unsub();
  }, [router, blocker.reset]);

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}

      <AlertDialog
        open={isBlocked}
        onOpenChange={(open) => {
          if (!open) {
            // User closed the dialog without choosing → cancel navigation
            blocker.reset?.();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Changements non enregistrés</AlertDialogTitle>
            <AlertDialogDescription>
              Vous avez des changements non enregistrés. Êtes-vous sûr de
              vouloir quitter cette page ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => {
                e.preventDefault();
                // User chose to stay → cancel navigation
                blocker.reset?.();
              }}
            >
              Rester
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                // User chose to leave → allow navigation
                blocker.proceed?.();
              }}
            >
              Quitter la page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges({ enabled }: { readonly enabled: boolean }) {
  const ctx = React.useContext(UnsavedChangesContext);
  if (!ctx) {
    throw new Error(
      'useUnsavedChanges must be used within an UnsavedChangesProvider',
    );
  }

  React.useEffect(() => {
    ctx.setEnabled(enabled);

    return () => {
      ctx.setEnabled(false);
    };
  }, [ctx, enabled]);
}
