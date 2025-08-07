import type { Id } from 'convex/_generated/dataModel';
import type { Prettified } from './types';

// biome-ignore lint/suspicious/noExplicitAny: Use any because its a utility function generic
type SystemFields = { _id: Id<any>; _creationTime: number };

type WithoutSystemFields<T> = Prettified<Omit<T, keyof SystemFields>>;

export function withoutSystemFields<T extends SystemFields>(doc: T) {
  const { _id, _creationTime, ...rest } = doc;
  return rest as WithoutSystemFields<T>;
}

export function withoutSystemFieldsArray<T extends SystemFields>(docs: T[]) {
  return docs.map(withoutSystemFields);
}
