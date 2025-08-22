import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import type { Role, Status } from 'convex/types';
import {
  CrownIcon,
  MoreVerticalIcon,
  SettingsIcon,
  UserCheckIcon,
  UserIcon,
  UserMinusIcon,
  UserPlusIcon,
  UserXIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentMember } from '@/hooks/use-current-member';
import { MemberPermissionsDialog } from './member-permissions-dialog';
import type { MemberActionsProps } from './types';

export function MemberActionsDropdown({
  member,
  householdPublicId,
}: MemberActionsProps) {
  const { currentMember } = useCurrentMember(householdPublicId);

  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);

  const updateRoleMutation = useConvexMutation(
    api.households_members.mutations.updateMemberRole,
  );
  const updateStatusMutation = useConvexMutation(
    api.households_members.mutations.updateMemberStatus,
  );
  const removeMemberMutation = useConvexMutation(
    api.households_members.mutations.removeMember,
  );

  const { mutate: updateRole, isPending: isUpdatingRole } = useMutation({
    mutationFn: updateRoleMutation,
    onSuccess: () => toast.success('Rôle mis à jour'),
    onError: (error) =>
      toast.error(error.message || 'Erreur lors de la mise à jour du rôle'),
  });

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: updateStatusMutation,
    onSuccess: () => toast.success('Statut mis à jour'),
    onError: (error) =>
      toast.error(error.message || 'Erreur lors de la mise à jour du statut'),
  });

  const { mutate: removeMember, isPending: isRemoving } = useMutation({
    mutationFn: removeMemberMutation,
    onSuccess: () => toast.success('Membre retiré du foyer'),
    onError: (error) =>
      toast.error(error.message || 'Erreur lors du retrait du membre'),
  });

  // Only admins can manage members
  if (currentMember.role !== 'admin') return null;

  // Check if this is the current user's own member record
  const isCurrentUser = currentMember._id === member._id;
  const isPending = isUpdatingRole || isUpdatingStatus || isRemoving;

  const handleRoleChange = (newRole: Role) => {
    updateRole({
      publicId: householdPublicId,
      memberId: member._id,
      role: newRole,
    });
  };

  const handleStatusChange = (newStatus: Exclude<Status, 'pending'>) => {
    updateStatus({
      publicId: householdPublicId,
      memberId: member._id,
      status: newStatus,
    });
  };

  const handleRemoveMember = () => {
    removeMember({
      publicId: householdPublicId,
      memberId: member._id,
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 w-8 h-8"
            disabled={isPending}
          >
            <MoreVerticalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Gestion</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Role Management - Don't allow users to change their own role */}
          {member.status === 'accepted' && !isCurrentUser && (
            <>
              {member.role === 'member' ? (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleRoleChange('admin')}
                  disabled={isPending}
                >
                  <CrownIcon className="mr-2 size-4" />
                  Promouvoir admin
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleRoleChange('member')}
                  disabled={isPending}
                >
                  <UserIcon className="mr-2 size-4" />
                  Rétrograder membre
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Status Management - Don't allow users to change their own status */}
          {!isCurrentUser && (
            <>
              {member.status === 'pending' && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange('accepted')}
                  disabled={isPending}
                  className="cursor-pointer"
                >
                  <UserCheckIcon className="mr-2 size-4" />
                  Accepter
                </DropdownMenuItem>
              )}

              {member.status !== 'banned' && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange('banned')}
                  disabled={isPending}
                  className="cursor-pointer"
                >
                  <UserXIcon className="mr-2 size-4" />
                  Bannir
                </DropdownMenuItem>
              )}

              {member.status === 'banned' && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange('accepted')}
                  disabled={isPending}
                  className="cursor-pointer"
                >
                  <UserPlusIcon className="mr-2 size-4" />
                  Réintégrer
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
            </>
          )}

          {/* Permissions Management */}
          {member.status === 'accepted' && (
            <>
              <DropdownMenuItem
                onClick={() => setShowPermissionsDialog(true)}
                disabled={isPending}
                className="cursor-pointer"
              >
                <SettingsIcon className="mr-2 size-4" />
                Gérer permissions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Remove Member - Don't allow users to remove themselves */}
          {!isCurrentUser && (
            <DropdownMenuItem
              onClick={handleRemoveMember}
              disabled={isPending}
              className="text-destructive cursor-pointer"
            >
              <UserMinusIcon className="mr-2 size-4" />
              Retirer du foyer
            </DropdownMenuItem>
          )}

          {/* Show message for current user */}
          {isCurrentUser && (
            <div className="px-2 py-1.5 text-muted-foreground text-xs">
              Vous ne pouvez pas modifier vos propres paramètres
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <MemberPermissionsDialog
        member={member}
        householdPublicId={householdPublicId}
        isOpen={showPermissionsDialog}
        onOpenChange={setShowPermissionsDialog}
      />
    </>
  );
}
