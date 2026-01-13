import type { Role } from '@backend/types';
import { CrownIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BadgeVariant } from './types';

const MEMBER_ROLE_VARIANTS: Record<Role, BadgeVariant> = {
  admin: { icon: CrownIcon, text: 'Administrateur', variant: 'default' },
  member: { text: 'Membre', variant: 'outline' },
};

export function MemberRoleBadge({ role }: { role: Role }) {
  const config = MEMBER_ROLE_VARIANTS[role];

  return (
    <Badge variant={config.variant} className={cn('gap-1', config.className)}>
      {config.icon && <config.icon className="size-3" />}
      {config.text}
    </Badge>
  );
}
