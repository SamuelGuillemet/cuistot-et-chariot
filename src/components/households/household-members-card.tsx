import { api } from '@api/api';
import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { LinkIcon, UsersIcon } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { MemberItem } from '@/components/households-members/member-item';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type Props = {
  householdPublicId: string;
};

export function HouseholdMembersCard({ householdPublicId }: Props) {
  const { data: members, isLoading } = useQuery(
    convexQuery(api.households_members.queries.getHouseholdMembers, {
      publicId: householdPublicId,
    }),
  );

  const { data: currentUserMember } = useQuery(
    convexQuery(api.households_members.queries.getCurrentUserMember, {
      publicId: householdPublicId,
    }),
  );

  const memberStats = useMemo(() => {
    if (!members) return { total: 0, admins: 0 };
    return {
      total: members.length,
      admins: members.filter((member) => member.role === 'admin').length,
    };
  }, [members]);

  const copyInvitationLink = async () => {
    const invitationUrl = `${window.location.origin}/household/join/${householdPublicId}`;
    try {
      await navigator.clipboard.writeText(invitationUrl);
      toast.success("Lien d'invitation copié dans le presse-papiers");
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  if (isLoading || !members || !currentUserMember) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="size-5" />
            Membres du foyer
          </CardTitle>
          <CardDescription>Chargement des membres...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="size-5" />
              Membres du foyer
            </CardTitle>
            <CardDescription>
              {memberStats.total} membre{memberStats.total > 1 ? 's' : ''} ·{' '}
              {memberStats.admins} administrateur
              {memberStats.admins > 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyInvitationLink}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <LinkIcon className="size-4" />
            <span className="sm:inline">Copier l'invitation</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => (
            <MemberItem
              key={member._id}
              member={member}
              householdPublicId={householdPublicId}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
