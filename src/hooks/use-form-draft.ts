import { useState, useSyncExternalStore } from 'react';
import * as v from 'valibot';

const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000;

const DraftSchema = v.pipe(
  v.string(),
  v.parseJson(),
  v.object({ timestamp: v.number(), data: v.unknown() }),
);

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

// Returns a string so React can compare snapshots by value.
function readDraft(key: string): string | null {
  const result = v.safeParse(DraftSchema, localStorage.getItem(key));
  if (!result.success || Date.now() - result.output.timestamp > DRAFT_EXPIRY_MS) return null;
  return JSON.stringify(result.output.data);
}

/** Keeps a copy of unsaved form values in localStorage (expires after 24h). */
export function useFormDraft<TValues>(storageKey: string) {
  const key = `form-draft-${storageKey}`;
  // Once the user edits or discards, a stored draft is no longer an offer to restore.
  const [dismissed, setDismissed] = useState(false);
  const snapshot = useSyncExternalStore(
    subscribe,
    () => readDraft(key),
    () => null,
  );

  return {
    values: dismissed || snapshot === null ? null : (JSON.parse(snapshot) as TValues),
    save: (values: TValues) => {
      localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data: values }));
      setDismissed(true);
    },
    clear: () => {
      localStorage.removeItem(key);
      setDismissed(true);
    },
  };
}
