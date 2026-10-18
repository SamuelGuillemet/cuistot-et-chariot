import { useSelector } from '@tanstack/react-form';
import { useFieldContext } from '@/lib/forms';
import type { FoodIcons } from '../food-icons/icon-food-font-config';
import { IconSelectorControlled } from '../food-icons/IconSelectorField';
import { BaseField, type BaseFieldProps, isFieldInvalid } from './base-field';

export function IconField(props: BaseFieldProps) {
  const field = useFieldContext<FoodIcons>();
  const value = useSelector(field.store, (state) => state.value);
  return (
    <BaseField {...props} field={field}>
      <IconSelectorControlled
        value={value}
        onChange={(icon) => field.handleChange(icon)}
        error={isFieldInvalid(field)}
      />
    </BaseField>
  );
}
