import { convexQuery } from '@convex-dev/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v3';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { debounceAsync } from '@/utils/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { PasswordInput } from '../ui/password-input';

// Debounced uniqueness check to avoid multiple sends while the user is typing
const debouncedExistsByName = debounceAsync(
  async (queryClient: QueryClient, name: string) => {
    return await queryClient.fetchQuery(
      convexQuery(api.households.existsByName, {
        name,
      }),
    );
  },
);

// Base schema for fields (used for typing and to compose a contextual schema)
const householdFieldsSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères.')
    .max(100, 'Le nom doit contenir au maximum 100 caractères.'),
  joinQuestion: z
    .string()
    .min(2, 'La question doit contenir au moins 2 caractères.')
    .max(200, 'La question doit contenir au maximum 200 caractères.'),
  joinAnswer: z
    .string()
    .min(2, 'La réponse doit contenir au moins 2 caractères.')
    .max(200, 'La réponse doit contenir au maximum 200 caractères.'),
});

// Schema factory to allow skipping uniqueness check when editing without changing name
function createHouseholdSchema(opts: {
  queryClient: QueryClient;
  initialName?: string;
}) {
  const initialName = opts.initialName?.trim();

  return householdFieldsSchema.superRefine(async (data, ctx) => {
    if (data.joinAnswer === data.joinQuestion) {
      ctx.addIssue({
        code: 'custom',
        message: 'La réponse ne peut pas être identique à la question.',
        path: ['joinAnswer'],
      });
    }

    // Skip uniqueness check if the name hasn't changed (editing self)
    if (initialName && data.name.trim() === initialName) {
      return;
    }

    const exists = await debouncedExistsByName(opts.queryClient, data.name);

    if (exists) {
      ctx.addIssue({
        code: 'custom',
        message: 'Un foyer avec ce nom existe déjà.',
        path: ['name'],
      });
    }
  });
}

export type HouseholdFormValues = z.infer<typeof householdFieldsSchema>;

const DEFAULT_VALUES: HouseholdFormValues = {
  name: '',
  joinQuestion: '',
  joinAnswer: '',
};

export function HouseholdForm({
  onSubmit,
  isPending,
  values,
}: {
  onSubmit: (values: HouseholdFormValues) => void;
  isPending: boolean;
  values?: HouseholdFormValues;
}) {
  const queryClient = useQueryClient();

  // Build a contextual schema to avoid duplicate-name errors when the name wasn't changed
  const householdSchema = createHouseholdSchema({
    queryClient,
    initialName: values?.name,
  });
  const form = useForm<HouseholdFormValues>({
    values: {
      name: values?.name || DEFAULT_VALUES.name,
      joinQuestion: values?.joinQuestion || DEFAULT_VALUES.joinQuestion,
      joinAnswer: values?.joinAnswer || DEFAULT_VALUES.joinAnswer,
    },
    resolver: zodResolver(householdSchema),
    mode: 'onChange',
  });

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Informations du foyer</CardTitle>
        <CardDescription>
          Renseignez un nom clair ainsi qu’une question/réponse secrète pour
          permettre aux membres de rejoindre le foyer.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="items-start gap-6 grid sm:grid-cols-2 mb-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Ce nom sera visible par les membres du foyer.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="joinQuestion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question secrète</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Cette question sera utilisée pour vérifier l'identité des
                    membres voulant rejoindre le foyer.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="joinAnswer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Réponse</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end border-t">
            <Button
              type="submit"
              disabled={isPending}
              className="gap-2 w-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  <span>En cours...</span>
                </>
              ) : (
                <span>Enregistrer</span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
