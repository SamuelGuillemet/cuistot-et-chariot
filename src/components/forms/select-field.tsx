import { useMemo } from 'react';
import { useFieldContext } from '@/lib/forms';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BaseField, type BaseFieldProps } from './base-field';

export function SelectField<TValue extends string>({
  placeholder,
  options,
  ...props
}: BaseFieldProps & {
  readonly placeholder?: string;
  readonly options: Record<TValue, string>;
}) {
  const field = useFieldContext<TValue>();

  const optionsList = useMemo(() => {
    const list: { value: TValue; label: string }[] = [];
    for (const [value, label] of Object.entries(options) as [TValue, string][]) {
      list.push({ value, label });
    }
    return list;
  }, [options]);

  return (
    <BaseField {...props} field={field}>
      {({ isInvalid }) => (
        <Select
          items={optionsList}
          name={field.name}
          value={field.state.value}
          onValueChange={(value) => {
            if (value !== null) field.handleChange(value as TValue);
          }}
          aria-invalid={isInvalid}
        >
          <SelectTrigger id={field.name} aria-invalid={isInvalid} onBlur={field.handleBlur}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {optionsList.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </BaseField>
  );
}
