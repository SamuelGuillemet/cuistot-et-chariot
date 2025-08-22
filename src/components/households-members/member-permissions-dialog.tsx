import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { useEffect, useId, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCurrentMember } from '@/hooks/use-current-member';
import type { HouseholdMember } from './types';

type MemberPermissionsDialogProps = {
  member: HouseholdMember;
  householdPublicId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MemberPermissionsDialog({
  member,
  householdPublicId,
  isOpen,
  onOpenChange,
}: MemberPermissionsDialogProps) {
  const { currentMember } = useCurrentMember(householdPublicId);

  const canEditHouseholdId = useId();

  const [permissions, setPermissions] = useState({
    canEditHousehold: member.canEditHousehold,
  });

  const updatePermissionsMutation = useConvexMutation(
    api.households_members.mutations.updateMemberPermissions,
  );

  const { mutate: updatePermissions, isPending } = useMutation({
    mutationFn: updatePermissionsMutation,
    onSuccess: () => {
      toast.success('Permissions mises à jour');
      onOpenChange(false);
    },
    onError: (error) =>
      toast.error(
        error.message || 'Erreur lors de la mise à jour des permissions',
      ),
  });

  // Reset permissions when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPermissions({
        canEditHousehold: member.canEditHousehold,
      });
    }
  }, [isOpen, member.canEditHousehold]);

  // Only admins can manage permissions
  if (currentMember.role !== 'admin') return null;

  const hasChanges = permissions.canEditHousehold !== member.canEditHousehold;

  const handleSave = () => {
    updatePermissions({
      publicId: householdPublicId,
      memberId: member._id,
      canEditHousehold: permissions.canEditHousehold,
    });
  };

  const handleCancel = () => {
    setPermissions({
      canEditHousehold: member.canEditHousehold,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gérer les permissions</DialogTitle>
          <DialogDescription>
            Configurez les permissions pour {member.user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="gap-4 grid py-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <Label htmlFor={canEditHouseholdId} className="text-base">
                Modifier le foyer
              </Label>
              <p className="text-muted-foreground text-sm">
                Permet de modifier les informations du foyer
              </p>
            </div>
            <Switch
              id={canEditHouseholdId}
              checked={permissions.canEditHousehold}
              onCheckedChange={(checked) =>
                setPermissions((prev) => ({
                  ...prev,
                  canEditHousehold: checked,
                }))
              }
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isPending || !hasChanges}>
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
