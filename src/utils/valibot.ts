import * as v from 'valibot';

export function typedEnum<T extends string>(
  data: Record<T, string>,
  message?: string,
) {
  const list: T[] = Object.keys(data) as T[];
  if (!message) {
    message = `Valeur doit être l'une de : ${list.join(', ')}`;
  }
  return v.picklist(list, message);
}
