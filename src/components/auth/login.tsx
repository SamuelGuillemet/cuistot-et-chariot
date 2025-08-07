import { useSearch } from '@tanstack/react-router';
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

export function Login() {
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

  return (
    <Card className="flex flex-col place-self-center space-y-3 mt-20 w-full min-[450px]:w-[400px]">
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
