/** biome-ignore-all lint/suspicious/noExplicitAny: Type helpers */
import type { FieldApi, FormValidators } from '@tanstack/react-form';

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type BetterOmit<T, K extends keyof T> = {
  [Property in keyof T as Property extends K ? never : Property]: T[Property];
};

export type TupleOf<T, U = T> = [T] extends [never]
  ? []
  : T extends any
    ? [T, ...TupleOf<Exclude<U, T>>]
    : never;

export type NeverParentSubmitMetaFieldApi = FieldApi<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  never
>;

export type Validators<TValues> = FormValidators<
  TValues,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

// Make a callback function to be possibly async
export type MaybeAsync<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => ReturnType<T> | Promise<ReturnType<T>>;
