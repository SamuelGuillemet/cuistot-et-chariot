import { createContext, type ReactNode, useContext, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { compareFooterItems, type FooterItemKey } from './footer-order';

/** `undefined` means no Layout above; `null` means the footer element is not mounted yet. */
export const FooterTargetContext = createContext<HTMLElement | null | undefined>(undefined);

function readFooterItemKey(element: HTMLElement): FooterItemKey {
  return { id: element.dataset.footerId ?? '', order: Number(element.dataset.footerOrder) };
}

/** Reorders wrappers in place, moving only the nodes that are out of position. */
function sortFooterItems(target: HTMLElement) {
  const current = Array.from(target.children, (child) => child as HTMLElement);

  if (import.meta.env.DEV) {
    const ids = current.map((element) => element.dataset.footerId);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) console.warn(`Duplicate footer item ids: ${duplicates.join(', ')}`);
  }

  const sorted = [...current].sort((a, b) =>
    compareFooterItems(readFooterItemKey(a), readFooterItemKey(b)),
  );

  sorted.forEach((element, index) => {
    if (target.children[index] !== element) {
      target.insertBefore(element, target.children[index] ?? null);
    }
  });
}

interface FooterItemProps {
  readonly children: ReactNode;
  readonly id: string;
  readonly order?: number;
}

/** Portals `children` into the layout footer; duplicate ids all render. */
export function FooterItem({ children, id, order = 0 }: FooterItemProps) {
  const target = useContext(FooterTargetContext);

  useLayoutEffect(() => {
    if (target) sortFooterItems(target);
  }, [target, id, order]);

  if (target === undefined) throw new Error('FooterItem must be rendered inside Layout.');
  if (target === null) return null;

  return createPortal(
    <div className="contents" data-footer-id={id} data-footer-order={order}>
      {children}
    </div>,
    target,
  );
}
