import { useFieldContext } from '@/lib/forms';
import { IconSelectorControlled } from '../food-icons/IconSelectorField';
import type { FoodIcons } from '../food-icons/icon-food-font-config';
import { BaseField, type BaseFieldProps } from './base-field';

export function IconField({ ...props }: Readonly<BaseFieldProps>) {
  const field = useFieldContext<FoodIcons>();

  return (
    <BaseField {...props} field={field}>
      {({ isInvalid }) => (
        <IconSelectorControlled
          value={field.state.value}
          onChange={(icon) => field.handleChange(icon)}
          error={isInvalid}
        />
      )}
    </BaseField>
  );
}
