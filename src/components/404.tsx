import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export function Page404() {
  return (
    <div className="flex flex-col justify-around items-center gap-8 w-full h-full grow">
      <div className="flex items-center my-4 text-9xl">
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
      <h2 className="opacity-0 my-4 text-4xl md:text-4xl uppercase animate-slide-in">
        La page est introuvable
      </h2>
      <p className="text-xl">
        La page que vous recherchez a peut-être été supprimée, a été renommée ou est provisoirement
        indisponible.
      </p>

      <Button render={<Link to="/" />}>Retourner à l&apos;accueil</Button>
    </div>
  );
}
