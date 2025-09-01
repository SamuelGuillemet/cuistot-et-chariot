import z from 'zod/v3';

export const typedEnum = <T extends string>(arr: Record<T, string>) =>
  z.enum(Object.keys(arr) as [T, ...T[]]);
