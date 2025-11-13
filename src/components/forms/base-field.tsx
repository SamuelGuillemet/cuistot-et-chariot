import { type AnyFieldApi, useStore } from '@tanstack/react-form';
import { createContext, useContext, useMemo } from 'react';
import type { NeverParentSubmitMetaFieldApi } from '@/utils/types';
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field';

export interface BaseFieldProps {
  readonly label: string;
  readonly description?: string;
  readonly required?: boolean;
}

// Context type
interface BaseFieldContextValue {
  fieldName: string;
  isInvalid: boolean;
  errors:
    | (
        | {
            message?: string;
          }
        | undefined
      )[]
    | undefined;
  required?: boolean;
}

// Create context
const BaseFieldContext = createContext<BaseFieldContextValue | null>(null);

// Hook to use the context
function useBaseField() {
  const context = useContext(BaseFieldContext);
  if (!context) {
    throw new Error(
      'BaseField compound components must be used within BaseField.Root',
    );
  }
  return context;
}

// Root component
function BaseFieldRoot({
  field,
  className,
  required,
  children,
}: {
  readonly field: AnyFieldApi | NeverParentSubmitMetaFieldApi;
  readonly className?: string;
  readonly required?: boolean;
  readonly children: React.ReactNode;
}) {
  const isTouched = useStore(field.store, (s) => s.meta.isTouched);
  const isValid = useStore(field.store, (s) => s.meta.isValid);
  const errors = useStore(field.store, (s) => s.meta.errors);

  const isInvalid = useMemo(() => isTouched && !isValid, [isTouched, isValid]);

  const contextValue = useMemo(
    () => ({ fieldName: field.name, isInvalid, errors, required }),
    [field.name, isInvalid, errors, required],
  );

  return (
    <BaseFieldContext.Provider value={contextValue}>
      <Field data-invalid={isInvalid} className={className}>
        {children}
      </Field>
    </BaseFieldContext.Provider>
  );
}

// Label component
function BaseFieldLabel({
  children,
  showRequired = true,
}: {
  readonly children: React.ReactNode;
  readonly showRequired?: boolean;
}) {
  const { fieldName, required } = useBaseField();

  return (
    <FieldLabel htmlFor={fieldName}>
      {children}
      {showRequired && required && <span className="text-destructive">*</span>}
    </FieldLabel>
  );
}

// Description component
function BaseFieldDescription({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <FieldDescription>{children}</FieldDescription>;
}

// Control component (for the input/select/etc.)
function BaseFieldControl({
  children,
}: {
  readonly children: (props: { isInvalid: boolean }) => React.ReactNode;
}) {
  const { isInvalid } = useBaseField();
  return <>{children({ isInvalid })}</>;
}

// Error component
function BaseFieldError() {
  const { isInvalid, errors } = useBaseField();

  if (!isInvalid) return null;

  return <FieldError errors={errors} />;
}

export function BaseField({
  field,
  label,
  required,
  description,
  children,
}: BaseFieldProps & {
  readonly field: AnyFieldApi | NeverParentSubmitMetaFieldApi;
  readonly children: (props: { isInvalid: boolean }) => React.ReactNode;
}) {
  'use no memo';
  return (
    <BaseFieldComposer.Root field={field} required={required}>
      <BaseFieldComposer.Label>{label}</BaseFieldComposer.Label>
      <BaseFieldComposer.Control>
        {({ isInvalid }) => children({ isInvalid })}
      </BaseFieldComposer.Control>
      <BaseFieldComposer.Error />
      {description && (
        <BaseFieldComposer.Description>
          {description}
        </BaseFieldComposer.Description>
      )}
    </BaseFieldComposer.Root>
  );
}

// Export as compound component
export const BaseFieldComposer = {
  Root: BaseFieldRoot,
  Label: BaseFieldLabel,
  Description: BaseFieldDescription,
  Control: BaseFieldControl,
  Error: BaseFieldError,
};
