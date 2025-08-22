import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import type { Household } from 'convex/types';
import {
  CheckIcon,
  ChevronsUpDownIcon,
  EditIcon,
  MapPinHouseIcon,
  PlusIcon,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useDidUpdateEffect } from '@/hooks/use-did-update-effect';
import { Route as AuthedRoute } from '@/routes/_authed';
import { householdStore, useHousehold } from '@/stores/household';
import { Button } from '../ui/button';

type Props = {
  households: {
    household: Household;
    role: string;
  }[];
};

export function Households() {
  const { householdId } = AuthedRoute.useLoaderData();

  React.useEffect(() => {
    householdStore.getState().initialize(householdId);
  }, [householdId]);

  const { data } = useSuspenseQuery(
    convexQuery(api.households.queries.getOwnHouseholds, {}),
  );

  if (data.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Link to="/household/new" className="flex items-center gap-2">
                  <div className="flex justify-center items-center bg-transparent border rounded-md size-8">
                    <PlusIcon className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground truncate">
                    Ajouter un foyer
                  </div>
                </Link>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return <HouseholdSwitcher households={data} />;
}

export function HouseholdSwitcher({ households }: Props) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const householdId = useHousehold.use.householdId();
  const setHouseholdId = useHousehold.use.setHouseholdId();

  const selectedHousehold = React.useMemo(
    () =>
      households.find((h) => h.household.publicId === householdId) ||
      households[0],
    [households, householdId],
  );

  React.useEffect(() => {
    setHouseholdId(selectedHousehold.household.publicId);
  }, [selectedHousehold, setHouseholdId]);

  useDidUpdateEffect(() => {
    toast.info(`Foyer sélectionné : ${selectedHousehold.household.name}`);
  }, [selectedHousehold]);

  const onSelectionChange = async (household: (typeof households)[0]) => {
    await setHouseholdId(household.household.publicId);
    router.invalidate();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex justify-center items-center bg-sidebar-primary rounded-lg size-8 aspect-square text-sidebar-primary-foreground">
                <MapPinHouseIcon className="size-4" />
              </div>
              <div className="flex-1 grid text-sm text-left leading-tight">
                <span className="font-medium truncate">
                  {selectedHousehold.household.name}
                </span>
                <span className="text-xs truncate">
                  {selectedHousehold.role}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Foyers
            </DropdownMenuLabel>
            {households.map((value) => (
              <DropdownMenuItem
                key={value.household.name}
                onClick={() => onSelectionChange(value)}
                className="gap-2 p-2"
              >
                {value.household.publicId === householdId ? (
                  <CheckIcon className="size-3.5 shrink-0" />
                ) : (
                  <span className="size-3.5 shrink-0" />
                )}
                <div className="flex justify-center items-center border rounded-md size-6">
                  <MapPinHouseIcon className="size-3.5 shrink-0" />
                </div>
                {value.household.name}
                <Button
                  variant="ghost"
                  asChild
                  className="ml-auto p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Close the dropdown menu
                  }}
                >
                  <Link
                    to="/household/$id"
                    params={{ id: value.household.publicId }}
                  >
                    <EditIcon className="size-3.5 shrink-0" />
                  </Link>
                </Button>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" asChild>
              <Link to="/household/new">
                <div className="flex justify-center items-center bg-transparent border rounded-md size-6">
                  <PlusIcon className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Ajouter un foyer
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
