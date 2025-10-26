import { api } from '@api/api';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { HomeIcon, Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod/v3';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const joinParams = z.object({
  id: z.string(),
});

const joinSchema = z.object({
  answer: z.string().min(1, 'La réponse est requise'),
});

type JoinFormValues = z.infer<typeof joinSchema>;

export const Route = createFileRoute('/_authed/household/join/$id')({
  component: RouteComponent,
  params: {
    parse: joinParams.parse,
  },
  loader: async (opts) => {
    try {
      await opts.context.convexQueryClient.queryClient.ensureQueryData(
        convexQuery(api.households.queries.getJoinHousehold, {
          publicId: opts.params.id,
        }),
      );
    } catch (_) {
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

  const form = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      answer: '',
    },
  });

  const onSubmit = (data: JoinFormValues) => {
    mutate({
      publicId: id,
      answer: data.answer,
    });
  };

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="flex flex-col gap-6 mb-6">
              <div className="space-y-2">
                <p className="font-medium text-sm">Question secrète :</p>
                <p className="bg-muted p-3 rounded-md text-muted-foreground text-sm">
                  {household.joinQuestion}
                </p>
              </div>
              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Votre réponse</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Entrez votre réponse"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Rejoindre le foyer'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
