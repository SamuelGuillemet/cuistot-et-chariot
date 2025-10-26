import type { Id } from './_generated/dataModel';

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type BetterOmit<T, K extends keyof T> = {
  [Property in keyof T as Property extends K ? never : Property]: T[Property];
};

// biome-ignore lint/suspicious/noExplicitAny: Use any because its a utility function generic
type SystemFields = { _id: Id<any>; _creationTime: number };

type WithoutSystemFields<T> = Prettify<Omit<T, keyof SystemFields>>;

export function withoutSystemFields<T extends SystemFields>(doc: T) {
  const { _id, _creationTime, ...rest } = doc;
  return rest as WithoutSystemFields<T>;
}

export function withoutSystemFieldsArray<T extends SystemFields>(docs: T[]) {
  return docs.map(withoutSystemFields);
}
