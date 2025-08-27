import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { IconSelectorControlled } from '@/components/food-icons/IconSelectorField';
import { getIconData } from '@/components/food-icons/icon-food-font-config';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export const Route = createFileRoute('/_authed/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const form = useForm<{ icon: string }>({
    defaultValues: {
      icon: '',
    },
  });

  const selectedFoodIconId = form.watch('icon');

  const selectedFoodIcon = useMemo(() => {
    return getIconData(selectedFoodIconId);
  }, [selectedFoodIconId]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sélecteur d'icônes alimentaires</CardTitle>
        <CardDescription>
          Composant spécialisé pour les icônes d'aliments avec police
          personnalisée
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icône</FormLabel>
                <FormControl>
                  <IconSelectorControlled {...field} />
                </FormControl>
                <FormDescription>
                  {selectedFoodIcon && (
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{selectedFoodIcon.name}</p>
                        <p className="text-muted-foreground text-sm">
                          Catégorie: {selectedFoodIcon.category}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          ID: {selectedFoodIcon.id}
                        </p>
                      </div>
                    </div>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </CardContent>
    </Card>
  );
}
