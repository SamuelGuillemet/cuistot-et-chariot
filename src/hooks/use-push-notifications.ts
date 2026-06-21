import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../convex/_generated/api';

// Clé publique VAPID — doit correspondre à VAPID_PUBLIC_KEY dans les variables Convex
// À définir dans .env.local : VITE_VAPID_PUBLIC_KEY=<ta_clé_publique>
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

type PushState = 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed';

export function usePushNotifications() {
  const [state, setState] = useState<PushState>('unsubscribed');
  const [isLoading, setIsLoading] = useState(false);

  const saveSubscription = useMutation({
    mutationFn: useConvexMutation(
      api.push_notifications.mutations.saveSubscription,
    ),
  });

  const deleteSubscription = useMutation({
    mutationFn: useConvexMutation(
      api.push_notifications.mutations.deleteSubscription,
    ),
  });

  // Détecte le support et l'état initial au montage
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }

    navigator.serviceWorker.ready.then(async (registration) => {
      const existing = await registration.pushManager.getSubscription();
      setState(existing ? 'subscribed' : 'unsubscribed');
    });
  }, []);

  const subscribe = useCallback(async () => {
    if (!VAPID_PUBLIC_KEY) {
      console.error('[push] VITE_VAPID_PUBLIC_KEY non définie dans .env.local');
      return;
    }

    setIsLoading(true);
    try {
      // Enregistre le service worker s'il ne l'est pas encore
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY,
      });

      const json = subscription.toJSON();
      const p256dh = json.keys?.p256dh;
      const auth = json.keys?.auth;
      if (!p256dh || !auth) {
        throw new Error(
          '[push] Clés de chiffrement manquantes dans la souscription',
        );
      }
      await saveSubscription.mutateAsync({
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime ?? undefined,
        p256dh,
        auth,
      });

      setState('subscribed');
    } catch (err) {
      if ((err as Error).name === 'NotAllowedError') {
        setState('denied');
      } else {
        console.error('[push] Échec de la souscription :', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [saveSubscription]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await deleteSubscription.mutateAsync({
          endpoint: subscription.endpoint,
        });
        await subscription.unsubscribe();
      }
      setState('unsubscribed');
    } catch (err) {
      console.error('[push] Échec du désabonnement :', err);
    } finally {
      setIsLoading(false);
    }
  }, [deleteSubscription]);

  return { state, isLoading, subscribe, unsubscribe };
}
