import { type AnyFormApi, createFormHook } from '@tanstack/react-form';
import { ResetButton, SubmitButton } from '@/components/forms/buttons';
import { IconField } from '@/components/forms/icon-field';
import { NumberField } from '@/components/forms/number-field';
import { PasswordField } from '@/components/forms/password-field';
import { SelectField } from '@/components/forms/select-field';
import { TextField } from '@/components/forms/text-field';
import { TextareaField } from '@/components/forms/textarea-field';
import { fieldContext, formContext } from '@/lib/forms';

export const { useAppForm } = createFormHook({
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

/** Pass as `onSubmitInvalid`: shows all errors and focuses the first invalid field (fields use their name as `id`). */
export function handleSubmitInvalid({ formApi }: { formApi: AnyFormApi }) {
  // TanStack skips form validation on submit when the form is already invalid, so fields
  // mounted since the last run (new array rows, StrictMode remounts) would miss their errors.
  void formApi.validate('submit');
  const selector = Object.entries(formApi.state.fieldMeta)
    .filter(([, meta]) => meta && !meta.isValid)
    .map(([name]) => `#${CSS.escape(name)}`)
    .join(',');
  if (selector) document.querySelector<HTMLElement>(selector)?.focus();
}
