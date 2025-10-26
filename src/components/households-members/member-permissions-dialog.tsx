import { api } from '@api/api';
import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
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
import {
  getChangedPermissions,
  hasPermissionChanges,
  initializePermissionsFromMember,
  PERMISSIONS_CONFIG,
} from './permissions-config';
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
  const { currentMember } = useCurrentMember();

  // Initialize permissions state from member data
  const initializePermissions = useCallback(() => {
    return initializePermissionsFromMember(member);
  }, [member]);

  const [permissions, setPermissions] = useState(initializePermissions);

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
      setPermissions(initializePermissions());
    }
  }, [isOpen, initializePermissions]);

  // Only admins can manage permissions
  if (currentMember.role !== 'admin') return null;

  // Check if any permissions have changed
  const hasChanges = hasPermissionChanges(member, permissions);

  const handleSave = () => {
    // Get only the changed permissions
    const updates = getChangedPermissions(member, permissions);

    updatePermissions({
      publicId: householdPublicId,
      memberId: member._id,
      ...updates,
    });
  };

  const handleCancel = () => {
    setPermissions(initializePermissions());
    onOpenChange(false);
  };

  const handlePermissionChange = (permissionKey: string, checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [permissionKey]: checked,
    }));
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
          {PERMISSIONS_CONFIG.map((permission) => (
            <div
              key={permission.key}
              className="flex justify-between items-center"
            >
              <div className="space-y-0.5">
                <Label htmlFor={permission.key} className="text-base">
                  {permission.label}
                </Label>
                <p className="text-muted-foreground text-sm">
                  {permission.description}
                </p>
              </div>
              <Switch
                id={permission.key}
                checked={permissions[permission.key] ?? false}
                onCheckedChange={(checked) =>
                  handlePermissionChange(permission.key, checked)
                }
                disabled={isPending}
              />
            </div>
          ))}
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
