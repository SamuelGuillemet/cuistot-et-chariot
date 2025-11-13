import { api } from '@api/api';
import { convexQuery } from '@convex-dev/react-query';
import { useQueryClient } from '@tanstack/react-query';
import * as v from 'valibot';
import { useAppForm } from '@/hooks/use-app-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';

const Household = v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.minLength(2, 'Le nom doit contenir au moins 2 caractères.'),
      v.maxLength(100, 'Le nom doit contenir au maximum 100 caractères.'),
    ),
    joinQuestion: v.pipe(
      v.string(),
      v.minLength(2, 'La question doit contenir au moins 2 caractères.'),
      v.maxLength(200, 'La question doit contenir au maximum 200 caractères.'),
    ),
    joinAnswer: v.pipe(
      v.string(),
      v.minLength(2, 'La réponse doit contenir au moins 2 caractères.'),
      v.maxLength(200, 'La réponse doit contenir au maximum 200 caractères.'),
    ),
  }),
  v.forward(
    v.check(
      (values) => values.joinQuestion !== values.joinAnswer,
      'La réponse ne peut pas être identique à la question.',
    ),
    ['joinAnswer'],
  ),
);

export type HouseholdFormValues = v.InferOutput<typeof Household>;

const DEFAULT_VALUES: HouseholdFormValues = {
  name: '',
  joinQuestion: '',
  joinAnswer: '',
};

export function HouseholdForm({
  onSubmit,
  isPending,
  values,
  readOnly,
}: Readonly<{
  onSubmit: (values: HouseholdFormValues) => void;
  isPending: boolean;
  values?: HouseholdFormValues;
  readOnly: boolean;
}>) {
  const queryClient = useQueryClient();
  const initialName = values?.name?.trim();

  const form = useAppForm<HouseholdFormValues>({
    defaultValues: DEFAULT_VALUES,
    initialValues: values,
    validator: {
      validateFn: Household,
      validateOn: ['onChange'],
    },
    onSubmit,
  });

  const validateNameAsync = async ({ value }: { value: string }) => {
    // Skip uniqueness check if the name hasn't changed (editing self)
    if (initialName && value.trim() === initialName) {
      return;
    }

    const exists = await queryClient.fetchQuery(
      convexQuery(api.households.queries.existsByName, {
        name: value,
      }),
    );
    if (exists) {
      return { message: 'Ce nom de foyer est déjà utilisé.' };
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Informations du foyer</CardTitle>
        <CardDescription>
          Renseignez un nom clair ainsi qu'une question/réponse secrète pour
          permettre aux membres de rejoindre le foyer.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <CardContent className="items-start gap-6 grid sm:grid-cols-2 mb-6">
          <div className="sm:col-span-2">
            <form.AppField
              name="name"
              asyncDebounceMs={150}
              validators={{
                onChangeAsync: validateNameAsync,
              }}
            >
              {(field) => (
                <field.TextField
                  label="Nom"
                  description="Ce nom sera visible par les membres du foyer."
                  required
                  disabled={readOnly}
                />
              )}
            </form.AppField>
          </div>
          <form.AppField name="joinQuestion">
            {(field) => (
              <field.TextField
                label="Question secrète"
                description="Cette question sera utilisée pour vérifier l'identité des membres voulant rejoindre le foyer."
                required
                disabled={readOnly}
              />
            )}
          </form.AppField>
          <form.AppField name="joinAnswer">
            {(field) => (
              <field.PasswordField
                label="Réponse secrète"
                autoComplete="off"
                required
                disabled={readOnly}
              />
            )}
          </form.AppField>
        </CardContent>
        <CardFooter className="flex justify-end border-t">
          <form.AppForm>
            <form.SubmitButton hidden={readOnly} isLoading={isPending} />
          </form.AppForm>
        </CardFooter>
      </form>
    </Card>
  );
}
