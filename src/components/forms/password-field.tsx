import { PasswordInput } from '@/components/ui/password-input';
import { useFieldContext } from '@/lib/forms';
import { BaseField, type BaseFieldProps, isFieldInvalid } from './base-field';

type InputProps = Omit<
  React.ComponentProps<typeof PasswordInput>,
  'value' | 'onChange' | 'id' | 'name' | 'aria-invalid' | 'onBlur' | 'type' | 'ref'
>;

export function PasswordField({
  label,
  description,
  required,
  ...props
}: BaseFieldProps & InputProps) {
  const field = useFieldContext<string>();

  return (
    <BaseField label={label} description={description} required={required} field={field}>
      <PasswordInput
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isFieldInvalid(field)}
        {...props}
      />
    </BaseField>
  );
}
