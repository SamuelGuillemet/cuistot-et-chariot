import * as v from 'valibot';

export function typedEnum<T extends string>(
  data: Record<T, string>,
  message: string,
) {
  const list: T[] = Object.keys(data) as T[];
  return v.picklist(list, message);
}
