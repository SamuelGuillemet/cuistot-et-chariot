import { useStore } from '@tanstack/react-form';
import { AlertCircleIcon, TrashIcon } from 'lucide-react';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as v from 'valibot';
import { Button } from '@/components/ui/button';
import type { useAppForm } from './use-app-form';

const DRAFT_DEBOUNCE_MS = 100;
const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h

interface Draft<TData> {
  timestamp: number;
  data: TData;
}

interface UseFormDraftOptions<TData> {
  /**
   * Form instance returned by `useAppForm`.
   */
  form: ReturnType<typeof useAppForm<TData>>;

  /**
   * Unique key for this form draft. Will be prefixed internally.
   */
  storageKey: string;

  /**
   * Enable/disable draft behavior entirely.
   * Defaults to `true`.
   */
  enabled?: boolean;
}

interface UseFormDraftResult {
  /**
   * React node for the draft banner (or `null` if hidden).
   * Render it where you want the banner to appear.
   */
  banner: ReactNode;
  /**
   * Manually restore the saved draft into the form.
   */
  restoreDraft: () => void;
  /**
   * Discard the saved draft and hide the banner.
   */
  discardDraft: () => void;
  /**
   * Clear draft from storage without any form-related side effects.
   */
  clearDraft: () => void;
}

const DraftSchema = v.pipe(
  v.string(),
  v.parseJson(),
  v.object({
    timestamp: v.number(),
    data: v.any(),
  }),
);

/**
 * Safely parse a draft from a raw JSON string.
 */
function parseDraft<TData>(raw: string): Draft<TData> | null {
  const parsed = v.safeParse(DraftSchema, raw);

  if (!parsed.success) {
    return null;
  }

  return parsed.output;
}

/**
 * Hook that adds "draft" behavior to a form.
 *
 * Behavior:
 * - On initial load:
 *   - If a valid draft exists for `storageKey`,
 *   - and it differs from current form values,
 *   - and the form is in its untouched/default state,
 *   - then a banner is displayed to propose restoring the draft.
 *
 * - "Restore" button:
 *   - Resets the form with the draft values.
 *
 * - "Discard" button:
 *   - Deletes the draft from storage and hides the banner.
 *
 * - Auto-save:
 *   - When the form is touched (not default state), the hook auto-saves a draft
 *     to localStorage with a 100ms debounce.
 *   - Drafts expire after 24 hours.
 */
export function useFormDraft<TData>({
  form,
  storageKey,
  enabled = true,
}: UseFormDraftOptions<TData>): UseFormDraftResult {
  const values = useStore(form.store, (state) => state.values);
  const isTouched = useStore(form.store, (state) => state.isTouched);

  const [savedDraft, setSavedDraft] = useState<TData | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draftKey = useMemo(() => `form-draft-${storageKey}`, [storageKey]);

  const loadDraftFromStorage = useCallback((): TData | null => {
    const raw = localStorage.getItem(draftKey);
    if (!raw) return null;

    const parsed = parseDraft<TData>(raw);
    if (!parsed) {
      localStorage.removeItem(draftKey);
      return null;
    }

    const isExpired = Date.now() - parsed.timestamp > DRAFT_EXPIRY_MS;
    if (isExpired) {
      localStorage.removeItem(draftKey);
      return null;
    }

    return parsed.data;
  }, [draftKey]);

  const saveDraftToStorage = useCallback(
    (data: TData) => {
      const payload: Draft<TData> = {
        timestamp: Date.now(),
        data,
      };
      localStorage.setItem(draftKey, JSON.stringify(payload));
      setSavedDraft(data);
    },
    [draftKey],
  );

  const clearDraftFromStorage = useCallback(() => {
    localStorage.removeItem(draftKey);
    setSavedDraft(null);
    setShowBanner(false);
  }, [draftKey]);

  const handleRestoreDraft = useCallback(() => {
    const draft = savedDraft ?? loadDraftFromStorage();
    if (!draft) return;

    form.reset(draft, { keepDefaultValues: true });
    setSavedDraft(draft);
    setShowBanner(false);
  }, [form, loadDraftFromStorage, savedDraft]);

  const handleDiscardDraft = useCallback(() => {
    clearDraftFromStorage();
  }, [clearDraftFromStorage]);

  const onInitialLoad = useEffectEvent(() => {
    if (!enabled) {
      setShowBanner(false);
      return;
    }

    const storedDraft = loadDraftFromStorage();

    if (!storedDraft) {
      setSavedDraft(null);
      setShowBanner(false);
      return;
    }

    setSavedDraft(storedDraft);

    const isDifferent = JSON.stringify(storedDraft) !== JSON.stringify(values);

    if (isDifferent && !isTouched) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  });

  // Initial load: decide whether to show the banner
  useEffect(() => {
    onInitialLoad();
  }, []);

  useEffect(() => {
    if (!enabled || !isTouched) {
      // At default values or when disabled we don't save a draft
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveDraftToStorage(values);
    }, DRAFT_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [enabled, isTouched, values, saveDraftToStorage]);

  const banner = showBanner ? (
    <div className="flex justify-between items-center gap-3 bg-amber-50 px-4 py-3 border border-amber-200 rounded-md">
      <div className="flex items-center gap-2 text-amber-900 text-sm">
        <AlertCircleIcon className="w-4 h-4 shrink-0" />
        <span>Un brouillon non enregistré a été trouvé.</span>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRestoreDraft}
        >
          Restaurer
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDiscardDraft}
          aria-label="Supprimer le brouillon"
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  ) : null;

  return {
    banner,
    restoreDraft: handleRestoreDraft,
    discardDraft: handleDiscardDraft,
    clearDraft: clearDraftFromStorage,
  };
}
