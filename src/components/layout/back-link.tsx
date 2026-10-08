import { createLink } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

function BackAnchor({ children, ...props }: ComponentProps<'a'>) {
  return (
    <a
      {...props}
      className="inline-flex items-center gap-1 -ml-1 min-h-11 md:min-h-0 text-muted-foreground hover:text-foreground text-sm self-start"
    >
      <ArrowLeftIcon className="size-4" /> {children}
    </a>
  );
}

export const BackLink = createLink(BackAnchor);
