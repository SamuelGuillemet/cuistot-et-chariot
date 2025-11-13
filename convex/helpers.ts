import { v } from 'convex/values';
import type { BetterOmit, Prettify } from './utils';

export function makeEnum<T extends string>(values: T[]) {
  return v.union(...values.map((value) => v.literal(value)));
}

type ValidateKeys<T, U, K extends keyof T> = Exclude<keyof T, K> extends keyof U
  ? Prettify<Partial<BetterOmit<T, K>>>
  : {
      __error: 'Contains invalid properties';
      __invalidKeys: Exclude<Exclude<keyof T, K>, keyof U>;
      __expectedKeys: keyof U;
    };

export function createPatchBuilder<
  U extends Record<string, unknown> = Record<string, unknown>,
>() {
  return function buildPatchData<
    T extends Record<string, unknown>,
    K extends keyof T,
  >(args: T, excludeKeys: K[]): ValidateKeys<T, U, K> {
    const patchData: Partial<T> = {};
    for (const key in args) {
      if (
        args[key] !== undefined &&
        !excludeKeys.includes(key as string as K)
      ) {
        patchData[key] = args[key];
      }
    }
    // biome-ignore lint/suspicious/noExplicitAny: Type 'Partial<T>' is not assignable to type 'ValidateKeys<T, U, K>'.
    return patchData as any;
  };
}
