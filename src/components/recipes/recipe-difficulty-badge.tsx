import type { RecipeDifficulty } from '@backend/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RecipeDifficultyBadgeProps {
  readonly difficulty: RecipeDifficulty;
  readonly className?: string;
}

const difficultyConfig: Record<
  RecipeDifficulty,
  { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
  easy: { label: 'Facile', variant: 'secondary' },
  medium: { label: 'Moyen', variant: 'default' },
  hard: { label: 'Difficile', variant: 'destructive' },
};

export function RecipeDifficultyBadge({
  difficulty,
  className,
}: RecipeDifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];

  return (
    <Badge variant={config.variant} className={cn('capitalize', className)}>
      {config.label}
    </Badge>
  );
}
