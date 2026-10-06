import { useFieldContext } from '@/lib/forms';
import { Input } from '../ui/input';
import { BaseField, type BaseFieldProps, isFieldInvalid } from './base-field';

type InputProps = Omit<
  React.ComponentProps<typeof Input>,
  'value' | 'onChange' | 'id' | 'name' | 'aria-invalid' | 'onBlur' | 'type'
>;

export function NumberField({
  label,
  description,
  required,
  ...props
}: BaseFieldProps & InputProps) {
  const field = useFieldContext<number | null>();

  return (
    <BaseField label={label} description={description} required={required} field={field}>
      <Input
        type="number"
        id={field.name}
        name={field.name}
        value={field.state.value ?? ''}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value === '' ? null : Number(e.target.value))}
        aria-invalid={isFieldInvalid(field)}
        {...props}
      />
    </BaseField>
  );
}
