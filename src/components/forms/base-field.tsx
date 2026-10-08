import type { AnyFieldApi } from '@tanstack/react-form';
import type { ReactNode } from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';

export interface BaseFieldProps {
  readonly label?: string;
  readonly description?: string;
  readonly required?: boolean;
}

// The field object given by TanStack Form gets a new identity whenever its state changes,
// so reading `field.state` during render is safe with the React Compiler.
type FieldLike = Pick<AnyFieldApi, 'name' | 'state'>;

export function isFieldInvalid(field: FieldLike) {
  return field.state.meta.isTouched && !field.state.meta.isValid;
}

/** Label + control + error message layout shared by every form field. */
export function BaseField({
  field,
  label,
  description,
  required,
  children,
}: BaseFieldProps & { readonly field: FieldLike; readonly children: ReactNode }) {
  const isInvalid = isFieldInvalid(field);

  return (
    <Field data-invalid={isInvalid}>
      {label && (
        <FieldLabel htmlFor={field.name}>
          {label}
          {required && (
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </FieldLabel>
      )}
      {children}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
}
