import { useForm, useStore } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';
import { IconSelectorControlled } from '@/components/food-icons/IconSelectorField';
import { getIconData } from '@/components/food-icons/icon-food-font-config';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/_authed/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const form = useForm({
    defaultValues: {
      icon: '',
    },
  });

  const selectedFoodIconId = useStore(form.store, (state) => state.values.icon);

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
        <form.Field name="icon">
          {(field) => (
            <div className="space-y-2">
              <label htmlFor={field.name} className="font-medium text-sm">
                Icône
              </label>
              <IconSelectorControlled
                value={field.state.value}
                onChange={field.handleChange}
              />
              {selectedFoodIcon && (
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
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
            </div>
          )}
        </form.Field>
      </CardContent>
    </Card>
  );
}
