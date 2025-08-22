import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';

export function HouseholdDeleteButton({
  householdId,
  hidden = false,
}: {
  householdId: string;
  hidden?: boolean;
}) {
  const router = useRouter();
  const mutationFn = useConvexMutation(
    api.households.mutations.deleteHousehold,
  );

  const { mutate } = useMutation({
    mutationFn,
    onError: (error) => {
      console.error('Error deleting household:', error);
      toast.error('Impossible de supprimer le foyer');
    },
    onSuccess: async () => {
      toast.success('Foyer supprimé avec succès');
      router.navigate({
        to: '/dashboard',
      });
    },
  });

  const handleDelete = async () => {
    mutate({ publicId: householdId });
  };

  if (hidden) {
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Supprimer</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le foyer</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer ce foyer ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
