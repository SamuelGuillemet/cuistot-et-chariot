export function uniqueObject<T extends Record<string, unknown>>(key: keyof T) {
  return (value: T, index: number, self: T[]): boolean => {
    return self.findIndex((item) => item[key] === value[key]) === index;
  };
}
