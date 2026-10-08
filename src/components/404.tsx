import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export function Page404() {
  return (
    <div className="flex flex-col justify-center items-center gap-6 px-4 py-12 w-full min-h-svh text-center grow">
      <div className="flex items-center text-8xl sm:text-9xl">
        <div className="opacity-0 animate-slide-in" style={{ animationDelay: '200ms' }}>
          4
        </div>
        <div className="opacity-0 animate-slide-in" style={{ animationDelay: '400ms' }}>
          0
        </div>
        <div className="opacity-0 animate-slide-in" style={{ animationDelay: '600ms' }}>
          4
        </div>
      </div>
      <h1 className="opacity-0 text-2xl sm:text-4xl uppercase animate-slide-in">
        La page est introuvable
      </h1>
      <p className="max-w-md text-muted-foreground text-base sm:text-xl">
        La page que vous recherchez a peut-être été supprimée, a été renommée ou est provisoirement
        indisponible.
      </p>

      <Button size="lg" nativeButton={false} render={<Link to="/recipes" />}>
        Retourner à l&apos;accueil
      </Button>
    </div>
  );
}
