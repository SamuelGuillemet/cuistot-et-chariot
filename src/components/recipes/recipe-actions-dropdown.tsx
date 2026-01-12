import type { Doc } from '@api/dataModel';
import { EditIcon, MoreVerticalIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RecipeDeleteDialog } from './recipe-delete-dialog';

interface RecipeActionsDropdownProps {
  readonly recipe: Doc<'recipes'>;
  readonly householdId: string;
  readonly canEdit: boolean;
  readonly onEdit: () => void;
}

export function RecipeActionsDropdown({
  recipe,
  householdId,
  canEdit,
  onEdit,
}: RecipeActionsDropdownProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!canEdit) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVerticalIcon className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <EditIcon className="mr-2 w-4 h-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive"
          >
            <TrashIcon className="mr-2 w-4 h-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RecipeDeleteDialog
        recipe={recipe}
        householdId={householdId}
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
