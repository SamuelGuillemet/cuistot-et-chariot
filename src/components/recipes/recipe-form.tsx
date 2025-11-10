import { api } from '@api/api';
import { convexQuery } from '@convex-dev/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PRODUCT_UNITS, RECIPE_DIFFICULTY_DISPLAY_NAMES } from 'convex/types';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod/v3';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { typedEnum } from '@/utils/zod';
import { getIconClass } from '../food-icons/icon-food-font-config';
import { RecipeInstructionsEditor } from './recipe-instructions-editor';

const recipeFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  instructions: z
    .array(
      z.object({
        order: z.number(),
        text: z.string().min(1, 'Chaque étape doit contenir du texte'),
      }),
    )
    .min(1, 'Ajoutez au moins une étape'),
  servings: z.coerce
    .number()
    .min(1, 'Au moins 1 portion')
    .max(50, 'Maximum 50 portions'),
  prepTime: z.coerce
    .number()
    .min(0, 'Le temps de préparation doit être positif'),
  cookTime: z.coerce.number().min(0, 'Le temps de cuisson doit être positif'),
  difficulty: typedEnum(RECIPE_DIFFICULTY_DISPLAY_NAMES),
  products: z.array(
    z.object({
      productId: z.string().min(1, 'Sélectionnez un produit'),
      quantity: z.coerce.number().min(0.01, 'La quantité doit être positive'),
      unit: typedEnum(PRODUCT_UNITS),
    }),
  ),
});

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;

interface RecipeFormProps {
  readonly onSubmit: (values: RecipeFormValues) => void;
  readonly isLoading?: boolean;
  readonly defaultValues?: Partial<RecipeFormValues>;
  readonly submitText?: string;
  readonly householdId: string;
}

export function RecipeForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  submitText = 'Créer la recette',
  householdId,
}: RecipeFormProps) {
  const form = useForm<RecipeFormValues>({
    defaultValues: {
      name: '',
      instructions: [],
      servings: 4,
      prepTime: 0,
      cookTime: 0,
      difficulty: 'easy',
      products: [],
      ...defaultValues,
    },
    resolver: zodResolver(recipeFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'products',
  });

  // Fetch available products
  const { data: availableProducts = [] } = useSuspenseQuery(
    convexQuery(api.products.queries.getProducts, { publicId: householdId }),
  );

  // Watch for product changes and update unit to defaultUnit
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (
        name?.startsWith('products.') &&
        name.endsWith('.productId') &&
        type === 'change'
      ) {
        const match = name.match(/products\.(\d+)\.productId/);
        if (match) {
          const index = Number.parseInt(match[1], 10);
          const productId = value.products?.[index]?.productId;

          if (productId) {
            const product = availableProducts.find((p) => p._id === productId);
            if (product?.defaultUnit) {
              form.setValue(`products.${index}.unit`, product.defaultUnit);
            }
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, availableProducts]);

  const handleSubmit = (values: RecipeFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="gap-6 grid">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de la recette *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Tarte aux pommes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="gap-4 grid md:grid-cols-3">
            <FormField
              control={form.control}
              name="servings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portions *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      placeholder="4"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulté *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une difficulté" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(RECIPE_DIFFICULTY_DISPLAY_NAMES).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="gap-4 grid md:grid-cols-3">
            <FormField
              control={form.control}
              name="prepTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temps de préparation (min) *</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="15" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cookTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temps de cuisson (min) *</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions *</FormLabel>
                <FormControl>
                  <RecipeInstructionsEditor
                    value={field.value}
                    onChange={field.onChange}
                    error={!!form.formState.errors.instructions}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Section Ingrédients */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <FormLabel>Ingrédients</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ productId: '', quantity: 1, unit: 'pieces' })
                }
                disabled={isLoading}
              >
                <PlusIcon className="mr-2 w-4 h-4" />
                Ajouter un ingrédient
              </Button>
            </div>

            {fields.length === 0 ? (
              <p className="py-4 border rounded-md text-muted-foreground text-sm text-center">
                Aucun ingrédient ajouté. Cliquez sur "Ajouter un ingrédient"
                pour commencer.
              </p>
            ) : (
              <div className="flex flex-col gap-4 bg-accent/50 p-4 border rounded-md">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="items-center gap-2 grid grid-cols-12"
                  >
                    <FormField
                      control={form.control}
                      name={`products.${index}.productId`}
                      render={({ field }) => (
                        <FormItem className="col-span-6">
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un produit" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableProducts.map((product) => (
                                  <SelectItem
                                    key={product._id}
                                    value={product._id}
                                  >
                                    <i
                                      className={cn(
                                        getIconClass(product.icon),
                                        'mr-2',
                                      )}
                                    />
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`products.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min={0.1}
                              placeholder="1"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`products.${index}.unit`}
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(PRODUCT_UNITS).map(
                                  ([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      {label}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={isLoading}
                      className="col-span-1 text-destructive hover:text-destructive"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            type="reset"
            disabled={isLoading}
            onClick={() => form.reset()}
          >
            Réinitialiser
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
