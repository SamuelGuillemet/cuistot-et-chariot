/** biome-ignore-all lint/suspicious/noExplicitAny: Type helpers */
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
