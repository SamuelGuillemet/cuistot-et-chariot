import { api } from '@api/api';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { HomeIcon } from 'lucide-react';
import { toast } from 'sonner';
import * as v from 'valibot';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAppForm } from '@/hooks/use-app-form';

const joinParams = v.object({
  id: v.string(),
});

const JoinSchema = v.object({
  answer: v.pipe(v.string(), v.minLength(1, 'La réponse est requise')),
});

type JoinSchema = v.InferOutput<typeof JoinSchema>;

export const Route = createFileRoute('/_authed/household/join/$id')({
  component: RouteComponent,
  params: {
    parse: (params) => v.parse(joinParams, params),
  },
  loader: async (opts) => {
    try {
      await opts.context.convexQueryClient.queryClient.ensureQueryData(
        convexQuery(api.households.queries.getJoinHousehold, {
          publicId: opts.params.id,
        }),
      );
    } catch {
      throw redirect({
        to: '/dashboard',
      });
    }

    return {
      breadcrumbs: 'Rejoindre un foyer',
    };
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const router = useRouter();

  const { data: household } = useSuspenseQuery(
    convexQuery(api.households.queries.getJoinHousehold, { publicId: id }),
  );

  const mutationFn = useConvexMutation(
    api.households_members.mutations.joinHousehold,
  );

  const { mutate, isPending } = useMutation({
    mutationFn,
    onError: (error) => {
      if (error.message.includes('already a member')) {
        toast.error('Vous êtes déjà membre de ce foyer');
      } else if (error.message.includes('Incorrect answer')) {
        toast.error('Réponse incorrecte');
      } else {
        toast.error('Impossible de rejoindre le foyer');
      }
    },
    onSuccess: () => {
      toast.success('Vous avez rejoint le foyer avec succès');
      router.navigate({ to: '/dashboard' });
    },
  });

  const form = useAppForm<JoinSchema>({
    defaultValues: {
      answer: '',
    },
    validator: {
      validateFn: JoinSchema,
    },
    onSubmit: (value) => {
      mutate({
        publicId: id,
        answer: value.answer,
      });
    },
  });

  return (
    <div className="flex justify-center items-center bg-background p-4 w-full min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center bg-primary/10 mx-auto mb-4 rounded-full w-16 h-16">
            <HomeIcon className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Rejoindre le foyer</CardTitle>
          <CardDescription>
            Vous êtes invité(e) à rejoindre le foyer{' '}
            <span className="font-semibold">{household.name}</span>
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <CardContent className="flex flex-col gap-6 mb-6">
            <div className="space-y-2">
              <p className="font-medium text-sm">Question secrète :</p>
              <p className="bg-muted p-3 rounded-md text-muted-foreground text-sm">
                {household.joinQuestion}
              </p>
            </div>
            <form.AppField name="answer">
              {(field) => (
                <field.TextField
                  label="Votre réponse"
                  placeholder="Entrez votre réponse"
                  required
                />
              )}
            </form.AppField>
          </CardContent>
          <CardFooter>
            <form.AppForm>
              <form.SubmitButton isLoading={isPending} className="w-full" />
            </form.AppForm>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
