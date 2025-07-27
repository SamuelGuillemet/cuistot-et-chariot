import { Link, useRouterState } from '@tanstack/react-router';
import { useTitle } from '@/hooks/use-title';
import { uniqueObject } from '@/utils/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';

export default function BreadcrumbComponent() {
  const breadcrumbs = useRouterState({
    select: (state) => {
      return state.matches.map((match) => ({
        title: match.loaderData?.breadcrumbs,
        path: match.pathname,
      }));
    },
  }).filter(uniqueObject('path'));

  useTitle(
    breadcrumbs[breadcrumbs.length - 1].title ?? 'Shopping List Recipe Builder',
  );

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <slot key={breadcrumb.path}>
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage className="font-semibold">
                  {breadcrumb.title}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={breadcrumb.path}>{breadcrumb.title}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </slot>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
