export interface FooterItemKey {
  readonly id: string;
  readonly order: number;
}

export function compareFooterItems(a: FooterItemKey, b: FooterItemKey): number {
  if (a.order !== b.order) return a.order - b.order;
  if (a.id === b.id) return 0;
  return a.id < b.id ? -1 : 1;
}
