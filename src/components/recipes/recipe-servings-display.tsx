import { UsersIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecipeServingsDisplayProps {
  readonly servings: number;
  readonly className?: string;
}

export function RecipeServingsDisplay({
  servings,
  className,
}: RecipeServingsDisplayProps) {
  return (
    <div className={cn('flex items-center gap-1 text-sm', className)}>
      <UsersIcon className="w-4 h-4" />
      <span>
        {servings} {servings > 1 ? 'portions' : 'portion'}
      </span>
    </div>
  );
}
