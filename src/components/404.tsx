import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export function Page404() {
  return (
    <div className="flex flex-col justify-around items-center gap-8 w-full h-full grow">
      <div className="flex items-center my-4 text-[11.5rem]">
        <div className="opacity-0 animate-slide-in [animation-delay:_0.2s]">
          4
        </div>
        <div className="opacity-0 animate-slide-in [animation-delay:_0.4s]">
          0
        </div>
        <div className="opacity-0 animate-slide-in [animation-delay:_0.6s]">
          4
        </div>
      </div>
      <h2 className="opacity-0 my-4 text-4xl md:text-4xl uppercase animate-slide-in">
        La page est introuvable
      </h2>
      <p className="text-xl">
        La page que vous recherchez a peut-être été supprimée, a été renommée ou
        est provisoirement indisponible.
      </p>

      <Button asChild>
        <Link to="/">Retourner à l&apos;accueil</Link>
      </Button>
    </div>
  );
}
