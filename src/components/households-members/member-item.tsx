import { UserIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MemberActionsDropdown } from './member-actions-dropdown';
import { MemberRoleBadge } from './member-role-badge';
import { MemberStatusBadge } from './member-status-badge';
import type { MemberActionsProps } from './types';

export function MemberItem({ member, householdPublicId }: MemberActionsProps) {
  const nameInitials = useMemo(() => {
    const [firstName, lastName] = member.user.name?.split(' ') ?? [];
    return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
  }, [member.user.name]);

  return (
    <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 bg-muted/50 p-3 border rounded-lg">
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={member.user.image} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {nameInitials || <UserIcon className="size-4" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{member.user.name}</p>
          <p className="text-muted-foreground text-xs truncate">
            {member.user.email}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <MemberRoleBadge role={member.role} />
        <MemberStatusBadge status={member.status} />
        <div className="ml-auto sm:ml-0">
          <MemberActionsDropdown
            member={member}
            householdPublicId={householdPublicId}
          />
        </div>
      </div>
    </div>
  );
}
