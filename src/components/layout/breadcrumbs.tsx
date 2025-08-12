import { Link, useRouterState } from '@tanstack/react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { uniqueObject } from '@/utils/utils';

export default function BreadcrumbComponent() {
  const breadcrumbs = useRouterState({
    select: (state) => {
      return state.matches.map((match) => {
        let path = match.pathname;
        if (
          match.loaderData &&
          'pathname' in match.loaderData &&
          match.loaderData.pathname
        ) {
          path = match.loaderData.pathname;
        }
        return {
          title: match.loaderData?.breadcrumbs,
          path,
        };
      });
    },
  })
    .filter((breadcrumb) => breadcrumb.title)
    .filter(uniqueObject('path'));

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
