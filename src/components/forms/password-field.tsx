import { useFieldContext } from '@/lib/forms';
import { PasswordInput } from '../ui/password-input';
import { BaseField, type BaseFieldProps } from './base-field';

type InputProps = Omit<
  React.ComponentProps<typeof PasswordInput>,
  | 'value'
  | 'onChange'
  | 'id'
  | 'name'
  | 'aria-invalid'
  | 'onBlur'
  | 'type'
  | 'ref'
>;

export function PasswordField({
  label,
  description,
  required,
  ...props
}: BaseFieldProps & InputProps) {
  const field = useFieldContext<string>();

  return (
    <BaseField
      label={label}
      description={description}
      required={required}
      field={field}
    >
      {({ isInvalid }) => (
        <PasswordInput
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          {...props}
        />
      )}
    </BaseField>
  );
}
