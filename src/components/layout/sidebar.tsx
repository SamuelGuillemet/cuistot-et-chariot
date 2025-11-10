import { Link } from '@tanstack/react-router';
import {
  ChefHatIcon,
  ChevronRightIcon,
  HomeIcon,
  PackageIcon,
  WarehouseIcon,
} from 'lucide-react';
import { useMemo } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentMember } from '@/hooks/use-current-member';
import type { FileRoutesByTo } from '@/routeTree.gen';
import { Households } from '../households/household-switcher';

type AllRoutes = keyof FileRoutesByTo;

type MenuItem = {
  title: string;
  url?: AllRoutes;
  icon?: React.ReactNode;
  isActive?: boolean;
  items?: {
    title: string;
    url: AllRoutes;
  }[];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentMember } = useCurrentMember();

  const menuItems: MenuItem[] = useMemo(() => {
    const menu: MenuItem[] = [];
    menu.push({
      title: "Page d'accueil",
      url: '/',
      icon: <HomeIcon className="w-5 h-5" />,
    });

    if (currentMember.canEditHousehold) {
      menu.push({
        title: 'Gestion du foyer',
        url: '/household',
        icon: <WarehouseIcon className="w-5 h-5" />,
      });
    }

    if (currentMember.canManageProducts) {
      menu.push({
        title: 'Produits',
        url: '/products',
        icon: <PackageIcon className="w-5 h-5" />,
      });
    }

    // Recettes disponibles pour tous les membres acceptés
    if (currentMember.status === 'accepted') {
      menu.push({
        title: 'Recettes',
        url: '/recipes',
        icon: <ChefHatIcon className="w-5 h-5" />,
      });
    }

    return menu;
  }, [currentMember]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Households />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menuItems} />
      </SidebarContent>
    </Sidebar>
  );
}

export function NavMain({ items }: { readonly items: MenuItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                {item.url ? (
                  // If the item has a URL, use Link
                  <Link
                    to={item.url}
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                ) : (
                  // Otherwise, just render the title with icon
                  <span className="flex items-center gap-4 px-2.5">
                    {item.icon}
                    <span>{item.title}</span>
                  </span>
                )}
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRightIcon />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              to={subItem.url}
                              className="flex items-center gap-2 px-2.5 text-muted-foreground hover:text-foreground"
                            >
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
