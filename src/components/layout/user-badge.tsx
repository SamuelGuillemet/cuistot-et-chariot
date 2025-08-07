import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { Authenticated, Unauthenticated } from 'convex/react';
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

export default function UserBadge() {
  const router = useRouter();
  const { data } = useSuspenseQuery(convexQuery(api.users.viewer, {}));

  const nameInitials = useMemo(() => {
    if (data) {
      const [firstName, lastName] = data.name?.split(' ') ?? [];
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    return '';
  }, [data]);

  const onLogout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.navigate({ to: '/login' });
        },
      },
    });
  };

  return (
    <>
      <Authenticated>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full overflow-hidden"
            >
              <Avatar>
                <AvatarImage src={data?.image} />
                <AvatarFallback>{nameInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mon compte ({data?.name})</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Authenticated>
      <Unauthenticated>
        <Link to="/login" className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Se connecter
          </Button>
        </Link>
      </Unauthenticated>
    </>
  );
}
