import { BellIcon, BellOffIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/use-push-notifications';

export function PushNotificationButton() {
  const { state, isLoading, subscribe, unsubscribe } = usePushNotifications();

  if (state === 'unsupported') return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {state === 'subscribed' ? (
            <BellIcon className="size-5" />
          ) : (
            <BellOffIcon className="size-5" />
          )}
          Notifications de repas
        </CardTitle>
        <CardDescription>
          Reçois une notification à 12h et 19h avec le repas du jour.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state === 'denied' ? (
          <p className="text-muted-foreground text-sm">
            Les notifications sont bloquées dans ton navigateur. Autorise-les
            dans les paramètres du site pour les activer.
          </p>
        ) : (
          <Button
            variant={state === 'subscribed' ? 'outline' : 'default'}
            onClick={state === 'subscribed' ? unsubscribe : subscribe}
            disabled={isLoading}
          >
            {isLoading
              ? 'Chargement…'
              : state === 'subscribed'
                ? 'Désactiver les notifications'
                : 'Activer les notifications'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
