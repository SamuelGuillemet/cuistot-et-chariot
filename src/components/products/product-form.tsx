import { zodResolver } from '@hookform/resolvers/zod';
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

// Product categories and units
const productCategories = [
  { value: 'dairy', label: 'Produits laitiers' },
  { value: 'meat', label: 'Viande' },
  { value: 'vegetables', label: 'Légumes' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'grains', label: 'Céréales' },
  { value: 'bakery', label: 'Boulangerie' },
  { value: 'frozen', label: 'Surgelés' },
  { value: 'beverages', label: 'Boissons' },
  { value: 'snacks', label: 'Collations' },
  { value: 'cleaning', label: 'Nettoyage' },
  { value: 'personal-care', label: 'Hygiène' },
  { value: 'other', label: 'Autres' },
] as const;

const productUnits = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'l' },
  { value: 'ml', label: 'ml' },
  { value: 'pieces', label: 'pièces' },
  { value: 'pack', label: 'paquet' },
  { value: 'bottle', label: 'bouteille' },
  { value: 'can', label: 'boîte' },
  { value: 'box', label: 'boîte' },
  { value: 'bag', label: 'sac' },
  { value: 'cup', label: 'tasse' },
  { value: 'tablespoon', label: 'cuillère à soupe' },
  { value: 'teaspoon', label: 'cuillère à café' },
] as const;

const productFormSchema = z.object({
  icon: z.string().min(1, 'Veuillez sélectionner une icône'),
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  description: z.string().max(500, 'La description est trop longue').optional(),
  category: z.enum([
    'dairy',
    'meat',
    'vegetables',
    'fruits',
    'grains',
    'bakery',
    'frozen',
    'beverages',
    'snacks',
    'condiments',
    'cleaning',
    'personal-care',
    'other',
  ]),
  defaultUnit: z.enum([
    'kg',
    'g',
    'l',
    'ml',
    'pieces',
    'pack',
    'bottle',
    'can',
    'box',
    'bag',
    'cup',
    'tablespoon',
    'teaspoon',
  ]),
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
                      {productCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
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
                      {productUnits.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
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
