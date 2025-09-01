import { zodResolver } from '@hookform/resolvers/zod';
import { CATEGORY_DISPLAY_NAMES, PRODUCT_UNITS } from 'convex/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v3';
import { IconSelectorControlled } from '@/components/food-icons/IconSelectorField';
import type { FoodIcons } from '@/components/food-icons/icon-food-font-config';
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
import { Textarea } from '@/components/ui/textarea';
import { typedEnum } from '@/utils/zod';

const productFormSchema = z.object({
  icon: z.string().min(1, 'Veuillez sélectionner une icône'),
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  description: z.string().max(500, 'La description est trop longue').optional(),
  category: typedEnum(CATEGORY_DISPLAY_NAMES),
  defaultUnit: typedEnum(PRODUCT_UNITS),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  onSubmit: (values: ProductFormValues) => void;
  isLoading?: boolean;
  defaultValues?: Partial<ProductFormValues>;
  submitText?: string;
}

export function ProductForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  submitText = 'Créer le produit',
}: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    defaultValues: {
      icon: '',
      name: '',
      description: '',
      category: 'other',
      defaultUnit: 'pieces',
      ...defaultValues,
    },
    resolver: zodResolver(productFormSchema),
  });

  const handleSubmit = (values: ProductFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="gap-6 grid">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icône *</FormLabel>
                <FormControl>
                  <IconSelectorControlled
                    value={field.value as FoodIcons}
                    onChange={(icon) => field.onChange(icon)}
                    error={!!form.formState.errors.icon}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="gap-4 grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom du produit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description du produit (optionnel)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="gap-4 grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CATEGORY_DISPLAY_NAMES).map(
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
            <FormField
              control={form.control}
              name="defaultUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unité par défaut *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une unité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PRODUCT_UNITS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
