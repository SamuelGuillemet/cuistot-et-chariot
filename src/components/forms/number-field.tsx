import { useFieldContext } from '@/lib/forms';
import { Input } from '../ui/input';
import { BaseField, type BaseFieldProps } from './base-field';

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

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stringValue = e.target.value;
    field.handleChange(stringValue === '' ? null : Number(stringValue));
  };

  return (
    <BaseField
      label={label}
      description={description}
      required={required}
      field={field}
    >
      {({ isInvalid }) => (
        <Input
          type="number"
          id={field.name}
          name={field.name}
          value={field.state.value ?? ''}
          onBlur={field.handleBlur}
          onChange={onChange}
          aria-invalid={isInvalid}
          {...props}
        />
      )}
    </BaseField>
  );
}
