import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFieldContext } from '@/lib/forms';
import { BaseField, type BaseFieldProps, isFieldInvalid } from './base-field';

export function SelectField<TValue extends string>({
  placeholder,
  options,
  ...props
}: BaseFieldProps & {
  readonly placeholder?: string;
  readonly options: Record<TValue, string>;
}) {
  const field = useFieldContext<TValue>();

  const isInvalid = isFieldInvalid(field);
  const items = (Object.entries(options) as [TValue, string][]).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <BaseField {...props} field={field}>
      <Select
        items={items}
        name={field.name}
        value={field.state.value}
        onValueChange={(value) => {
          if (value !== null) field.handleChange(value);
        }}
        aria-invalid={isInvalid}
      >
        <SelectTrigger
          id={field.name}
          aria-label={props.label}
          aria-invalid={isInvalid}
          onBlur={field.handleBlur}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </BaseField>
  );
}
