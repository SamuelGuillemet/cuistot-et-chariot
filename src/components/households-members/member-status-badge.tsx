import type { Status } from '@backend/types';
import { BanIcon, HourglassIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BadgeVariant } from './types';

const MEMBER_STATUS_VARIANTS: Record<
  Exclude<Status, 'accepted'>,
  BadgeVariant
> = {
  pending: {
    icon: HourglassIcon,
    variant: 'outline',
    text: 'En attente',
    className: 'border-yellow-300 text-yellow-700 bg-yellow-50',
  },
  banned: {
    icon: BanIcon,
    variant: 'destructive',
    text: 'Banni',
  },
};

export function MemberStatusBadge({ status }: { status: Status }) {
  if (status === 'accepted') return null;

  const config = MEMBER_STATUS_VARIANTS[status];

  return (
    <Badge variant={config.variant} className={cn('gap-1', config.className)}>
      {config.icon && <config.icon className="size-4" />}
      {config.text}
    </Badge>
  );
}
