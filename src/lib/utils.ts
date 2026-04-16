import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function entries<EnumType extends string>(
  e: Record<EnumType, string>,
): [EnumType, string][] {
  return Object.entries(e) as [EnumType, string][];
}
