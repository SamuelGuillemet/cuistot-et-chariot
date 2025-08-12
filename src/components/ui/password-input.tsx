import { EyeClosedIcon, EyeIcon } from 'lucide-react';
import { forwardRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const PasswordInput = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const disabled =
    props.value === '' || props.value === undefined || props.disabled;

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        className={cn('pr-10 hide-password-toggle', className)}
        ref={ref}
        autoComplete="current-password"
        placeholder="************"
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="top-0 right-0 absolute hover:bg-transparent px-3 py-2 h-full"
        onClick={() => setShowPassword((prev) => !prev)}
        disabled={disabled}
        tabIndex={-1}
      >
        {showPassword && !disabled ? (
          <EyeIcon className="w-4 h-4" aria-hidden="true" />
        ) : (
          <EyeClosedIcon className="w-4 h-4" aria-hidden="true" />
        )}
        <span className="sr-only">
          {showPassword ? 'Hide password' : 'Show password'}
        </span>
      </Button>

      {/* hides browsers password toggles */}
      <style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
