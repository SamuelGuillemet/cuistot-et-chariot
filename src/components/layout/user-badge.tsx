import { api } from '@api/api';
import { convexQuery } from '@convex-dev/react-query';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';
import { authSessionQueryOptions } from '@/lib/server-queries';

export default function UserBadge() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(convexQuery(api.users.viewer, {}));

  const nameInitials = useMemo(() => {
    const [firstName, lastName] = data.name.split(' ') ?? [];
    return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
  }, [data]);

  const onLogout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          queryClient.setQueryData(authSessionQueryOptions().queryKey, {
            token: undefined,
          });
          router.navigate({ to: '/login' });
          location.reload();
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full overflow-hidden"
        >
          <Avatar>
            <AvatarImage src={data.image} />
            <AvatarFallback>{nameInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Mon compte ({data.name})</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
