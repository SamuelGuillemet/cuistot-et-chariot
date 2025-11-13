import { createFormHook, type StandardSchemaV1 } from '@tanstack/react-form';
import { ResetButton, SubmitButton } from '@/components/forms/buttons';
import { IconField } from '@/components/forms/icon-field';
import { NumberField } from '@/components/forms/number-field';
import { PasswordField } from '@/components/forms/password-field';
import { SelectField } from '@/components/forms/select-field';
import { TextField } from '@/components/forms/text-field';
import { TextareaField } from '@/components/forms/textarea-field';
import { fieldContext, formContext } from '@/lib/forms';
import type { MaybeAsync, Validators } from '@/utils/types';

const {
  useAppForm: usePrefilledForm,
  withFieldGroup,
  withForm,
} = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    IconField,
    TextField,
    TextareaField,
    SelectField,
    NumberField,
    PasswordField,
  },
  formComponents: {
    SubmitButton,
    ResetButton,
  },
});

type ValidateOnKeys<TValues> = Exclude<keyof Validators<TValues>, 'onSubmit'>[];

function focusFirstError(errorMap: Record<string, unknown>) {
  const inputsOrButtons: (
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLButtonElement
  )[] = Array.from(document.querySelectorAll('input, textarea, button'));

  for (const input of inputsOrButtons) {
    const deniedNames = [input.name, input.id];
    const name = deniedNames.find(Boolean) as string;
    if (errorMap[name]) {
      input.focus();
      break;
    }
  }
}

async function maybeAwait<T>(value: T | Promise<T>): Promise<T> {
  return value instanceof Promise ? await value : value;
}

export function useAppForm<TValues>(options: {
  defaultValues: TValues;
  initialValues?: Partial<TValues>;
  onSubmit: MaybeAsync<(values: TValues) => void>;
  validator: {
    validateFn: StandardSchemaV1<TValues, TValues>;
    /**
     * Defaults to `['onChange']`
     */
    validateOn?: ValidateOnKeys<TValues>;
  };
}) {
  const validators = (options.validator.validateOn ?? ['onChange']).reduce(
    (acc, key) => {
      acc[key] = options.validator.validateFn;
      return acc;
    },
    {
      onSubmit: options.validator.validateFn,
    } as Validators<TValues>,
  );

  const defaultValues = {
    ...options.defaultValues,
    ...options.initialValues,
  } as TValues;

  return usePrefilledForm({
    defaultValues,
    validators,

    onSubmit: async ({ value }) => {
      const transformedValue = await maybeAwait(
        options.validator.validateFn['~standard'].validate(value),
      );
      if (!('value' in transformedValue)) {
        throw new Error('Validation failed on submit.');
      }
      await options.onSubmit(transformedValue.value);
    },
    onSubmitInvalid({ formApi }) {
      const errorMap = formApi.state.errorMap.onChange || {};
      focusFirstError(errorMap);
    },
  });
}

export type AppForm<TValues> = ReturnType<typeof useAppForm<TValues>>;

export { withFieldGroup, withForm };
