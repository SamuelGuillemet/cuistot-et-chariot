import { useFieldContext } from '@/lib/forms';
import { Textarea } from '../ui/textarea';
import { BaseField, type BaseFieldProps, isFieldInvalid } from './base-field';

type TextareaProps = Omit<
  React.ComponentProps<typeof Textarea>,
  'value' | 'onChange' | 'id' | 'name' | 'aria-invalid' | 'onBlur' | 'type'
>;

export function TextareaField({
  label,
  description,
  required,
  rows = 3,
  ...props
}: BaseFieldProps & TextareaProps) {
  const field = useFieldContext<string>();

  return (
    <BaseField label={label} description={description} required={required} field={field}>
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value ?? ''}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isFieldInvalid(field)}
        rows={rows}
        {...props}
      />
    </BaseField>
  );
}
