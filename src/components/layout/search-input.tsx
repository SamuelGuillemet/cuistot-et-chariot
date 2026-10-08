import { SearchIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly placeholder: string;
  readonly label: string;
  readonly className?: string;
}

export function SearchInput({
  value,
  onValueChange,
  placeholder,
  label,
  className,
}: SearchInputProps) {
  return (
    <div className={cn('relative flex-1', className)}>
      <SearchIcon className="top-1/2 left-2.5 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 pointer-events-none" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="pr-10 pl-8 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <div className="absolute inset-y-0 right-0.5 flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Effacer la recherche"
            onClick={() => onValueChange('')}
          >
            <XIcon />
          </Button>
        </div>
      )}
    </div>
  );
}
