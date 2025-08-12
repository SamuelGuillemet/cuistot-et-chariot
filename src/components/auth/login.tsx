import { useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';

const TraductionMap: Record<string, string> = {
  unable_to_create_user: "Impossible de créer l'utilisateur",
};

export function LoginForm() {
  const { error, redirect } = useSearch({
    from: '/login',
  });

  const handleSignIn = () => {
    authClient.signIn.social({
      provider: 'google',
      errorCallbackURL: '/login',
      callbackURL: redirect || '/',
    });
  };

  useEffect(() => {
    if (error) {
      toast.error(TraductionMap[error] || error);
    }
  }, [error]);

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="font-bold text-xl md:text-2xl">
          Connectez-vous
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Connectez-vous pour accéder à votre liste de courses et vos recettes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={handleSignIn}>
          Se connecter avec Google
        </Button>
      </CardContent>
      <CardFooter>
        {error && (
          <p className="text-red-500 text-sm">
            Une erreur s'est produite lors de la connexion :{' '}
            {TraductionMap[error] || error}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
