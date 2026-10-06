import { AlertCircleIcon, TrashIcon } from 'lucide-react';
import { Button } from '../ui/button';

export function DraftBanner({
  onRestore,
  onDiscard,
}: {
  readonly onRestore: () => void;
  readonly onDiscard: () => void;
}) {
  return (
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
          onClick={onRestore}
          aria-label="Restaurer le brouillon"
        >
          Restaurer
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDiscard}
          aria-label="Supprimer le brouillon"
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
