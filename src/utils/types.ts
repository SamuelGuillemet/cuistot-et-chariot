export type Prettified<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends bigint
        ? bigint
        : T extends Date
          ? Date
          : T extends Array<infer U>
            ? Array<Prettified<U>>
            : T extends object
              ? {
                  [K in keyof T]: Prettified<T[K]>;
                }
              : T;
