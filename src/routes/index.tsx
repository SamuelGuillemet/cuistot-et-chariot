import { createFileRoute, Link } from '@tanstack/react-router';
import { Authenticated, Unauthenticated } from 'convex/react';
import {
  ChefHatIcon as ChefHat,
  ClockIcon as Clock,
  HeartIcon as Heart,
  ListChecksIcon as ListChecks,
  SearchIcon as Search,
  ShieldCheckIcon as ShieldCheck,
  ShoppingCartIcon as ShoppingCart,
  SparklesIcon as Sparkles,
  TrendingUpIcon,
  UsersIcon as Users,
  ZapIcon as Zap,
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

export const meta = () => {
  return [
    {
      title:
        'Cuistot et Chariot | Organisez vos recettes et simplifiez vos courses',
    },
    {
      name: 'description',
      content:
        "L'application qui vous aide à organiser vos recettes, planifier vos repas et créer automatiquement votre liste de courses.",
    },
  ];
};

// Wrapper unifié pour centrer correctement tous les contenus
function PageContainer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'z-1 relative mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl',
        className,
      )}
      {...props}
    />
  );
}

function LandingPage() {
  return (
    <div className="flex flex-col bg-background min-h-screen text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <SocialProof />
        <Problem />
        <HowItWorks />
        <Features />
        <ValueBlocks />
        <RealtimeSection />
        <FAQ />
        <CTA />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="top-0 z-40 sticky bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-b w-full">
      <PageContainer className="flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <div className="flex justify-center items-center bg-primary shadow-sm rounded-md w-9 h-9 text-primary-foreground">
            <ChefHat className="w-5 h-5" />
          </div>
          <span className="font-semibold text-primary">Cuistot et Chariot</span>
        </div>
        <nav className="hidden md:flex gap-6 font-medium text-sm">
          <a
            href="#fonctionnalites"
            className="hover:text-primary transition-colors"
          >
            Comment ça marche
          </a>
          <a href="#avantages" className="hover:text-primary transition-colors">
            Avantages
          </a>
          <a href="#faq" className="hover:text-primary transition-colors">
            Questions
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Authenticated>
            <Link
              to="/dashboard"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'hidden sm:inline-flex',
              )}
            >
              Mon compte
            </Link>
          </Authenticated>
          <Unauthenticated>
            <Link
              to="/login"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'hidden sm:inline-flex',
              )}
            >
              Se connecter
            </Link>
          </Unauthenticated>
          <ThemeToggle />
        </div>
      </PageContainer>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative border-b h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-secondary/10" />
      <div className="top-0 right-0 absolute bg-secondary/10 blur-3xl rounded-full w-1/3 h-1/3" />
      <div className="bottom-0 left-0 absolute bg-secondary/5 blur-3xl rounded-full w-1/4 h-1/4" />
      <PageContainer className="flex justify-center items-center h-full">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 bg-secondary/10 mb-4 px-4 py-1 border border-secondary/20 rounded-full font-medium text-secondary text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Simple • Pratique • Fait pour toute la famille
          </div>
          <h1 className="font-bold text-4xl md:text-5xl text-balance tracking-tight">
            Organisez vos recettes et
            <span className="text-primary"> simplifiez vos courses</span> en
            famille
          </h1>
          <p className="mt-6 text-muted-foreground md:text-lg text-balance">
            Fini les listes de courses oubliées et les ingrédients en double !
            Créez vos recettes, planifiez vos repas et laissez l'application
            générer votre liste de courses automatiquement.
          </p>
          <div className="flex sm:flex-row flex-col justify-center items-center gap-4 mt-8">
            <Authenticated>
              <Link
                to="/dashboard"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'shadow-lg hover:shadow-xl transition-all duration-300',
                )}
              >
                Mon compte
              </Link>
            </Authenticated>
            <Unauthenticated>
              <Link
                to="/login"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'shadow-lg hover:shadow-xl transition-all duration-300',
                )}
              >
                Essayer gratuitement
              </Link>
            </Unauthenticated>
            <Link
              to="/"
              hash="fonctionnalites"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'hover:bg-primary/5',
              )}
            >
              Voir comment ça marche
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="py-12 md:py-16">
      <PageContainer>
        <div className="items-center gap-6 grid md:grid-cols-2">
          {[
            {
              k: '2h/sem',
              v: 'Temps économisé sur la planification des repas',
            },
            { k: '0', v: 'Aucun produit oublié dans vos courses' },
          ].map((item) => (
            <div
              key={item.k}
              className="bg-card shadow-md hover:shadow-lg px-6 py-6 border rounded-xl text-center hover:scale-105 transition-all duration-300"
            >
              <div className="font-bold text-primary text-3xl">{item.k}</div>
              <div className="mt-2 text-muted-foreground text-sm">{item.v}</div>
            </div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

function Problem() {
  return (
    <section className="bg-muted/30 border-y">
      <PageContainer className="py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-semibold text-3xl md:text-4xl text-center tracking-tight">
            Vous en avez marre des courses
            <span className="text-destructive"> désorganisées</span> ?
          </h2>
          <p className="mt-6 text-muted-foreground md:text-lg text-center">
            Listes de courses sur des bouts de papier, ingrédients achetés en
            double, oublis fréquents... Il existe une façon plus simple de
            s'organiser en cuisine !
          </p>
        </div>
      </PageContainer>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: '1. Créez votre garde-manger virtuel',
      icon: Heart,
      text: "Ajoutez vos produits habituels une seule fois. Plus de doublons entre 'tomate' et 'tomates' !",
    },
    {
      title: '2. Notez vos recettes préférées',
      icon: ChefHat,
      text: 'Sauvegardez vos recettes avec les ingrédients, temps de préparation et instructions.',
    },
    {
      title: '3. Planifiez vos repas',
      icon: ListChecks,
      text: 'Choisissez quelles recettes vous voulez faire cette semaine.',
    },
    {
      title: '4. Vérifiez ce que vous avez déjà',
      icon: Search,
      text: "L'application regarde ce qui est déjà dans vos placards pour éviter les achats inutiles.",
    },
    {
      title: '5. Recevez votre liste de courses',
      icon: ShoppingCart,
      text: "Une liste claire, organisée par rayons, avec juste ce qu'il vous faut !",
    },
  ];

  return (
    <section id="fonctionnalites" className="bg-muted/20 py-24">
      <PageContainer>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-semibold text-3xl md:text-4xl tracking-tight">
            Comment ça
            <span className="text-primary"> marche</span> ?
          </h2>
          <p className="mt-4 text-muted-foreground">
            En 5 étapes simples, transformez votre façon de faire les courses
          </p>
        </div>
        <div className="gap-6 grid md:grid-cols-3 lg:grid-cols-5 mt-14">
          {steps.map((s, index) => (
            <Card
              key={s.title}
              className="relative bg-card/60 shadow-lg hover:shadow-xl backdrop-blur-sm h-full hover:scale-105 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex justify-center items-center bg-primary shadow-md rounded-xl w-11 h-11 text-primary-foreground">
                  <s.icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-base">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                {s.text}
              </CardContent>
              {index < steps.length - 1 && (
                <div className="hidden lg:block top-1/2 -right-8 absolute -translate-y-1/2 transform">
                  <div className="bg-primary/30 w-8 h-0.5" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

function Features() {
  const list = [
    {
      icon: ChefHat,
      title: 'Vos recettes, bien organisées',
      desc: 'Sauvegardez toutes vos recettes préférées avec photos, temps de préparation et instructions.',
    },
    {
      icon: ListChecks,
      title: 'Liste de courses automatique',
      desc: "L'application calcule automatiquement ce dont vous avez besoin pour vos repas prévus.",
    },
    {
      icon: Users,
      title: 'Parfait pour toute la famille',
      desc: 'Chacun peut ajouter ses recettes et voir en temps réel les mises à jour.',
    },
    {
      icon: Zap,
      title: 'Toujours à jour',
      desc: 'Vos listes se mettent à jour instantanément, même si vous modifiez vos plans.',
    },
    {
      icon: Search,
      title: 'Trouvez tout facilement',
      desc: 'Recherchez rapidement parmi vos produits et recettes.',
    },
    {
      icon: Heart,
      title: 'Suivez votre stock',
      desc: 'Notez ce que vous avez déjà pour éviter les achats en double.',
    },
  ];

  return (
    <section className="py-24">
      <PageContainer>
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="font-semibold text-3xl md:text-4xl tracking-tight">
            Tout ce qu'il vous
            <span className="text-primary"> faut</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Des fonctionnalités simples pour simplifier votre quotidien
          </p>
        </div>
        <div className="gap-6 grid md:grid-cols-2 lg:grid-cols-3">
          {list.map((f) => (
            <Card
              key={f.title}
              className="bg-card/80 shadow-lg hover:shadow-xl backdrop-blur-sm hover:scale-105 transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="flex justify-center items-center bg-primary/10 shadow-md rounded-xl w-11 h-11 text-primary">
                  <f.icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                {f.desc}
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

function ValueBlocks() {
  const blocks = [
    {
      title: 'Économisez sur vos courses',
      text: "Plus d'achats inutiles ! Vous savez exactement ce dont vous avez besoin.",
      icon: TrendingUpIcon,
    },
    {
      title: 'Gagnez du temps',
      text: 'Fini les allers-retours au magasin. Une seule liste, bien organisée.',
      icon: Clock,
    },
    {
      title: 'Courses efficaces',
      text: 'Liste organisée par rayons pour faire vos courses rapidement.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="avantages" className="bg-muted/20 py-24">
      <PageContainer>
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="font-semibold text-3xl md:text-4xl tracking-tight">
            Pourquoi vous allez
            <span className="text-primary"> adorer</span>
          </h2>
        </div>
        <div className="gap-6 grid md:grid-cols-3">
          {blocks.map((b) => (
            <Card
              key={b.title}
              className="bg-card/60 shadow-lg hover:shadow-xl backdrop-blur-sm hover:scale-105 transition-all duration-300"
            >
              <CardHeader className="text-center">
                <div className="flex justify-center items-center bg-primary shadow-lg mx-auto rounded-2xl w-16 h-16 text-primary-foreground">
                  <b.icon className="w-8 h-8" />
                </div>
                <CardTitle className="text-lg">{b.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm text-center">
                {b.text}
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

function RealtimeSection() {
  return (
    <section className="relative border-y overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-background to-secondary/10" />
      <div className="top-0 left-0 absolute bg-secondary/5 blur-3xl w-1/2 h-full" />
      <PageContainer className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 bg-secondary/10 mb-6 px-4 py-2 border border-secondary/20 rounded-full font-medium text-secondary text-sm">
            <Zap className="w-4 h-4" />
            Synchronisation en temps réel
          </div>
          <h3 className="font-semibold text-3xl md:text-4xl tracking-tight">
            Toujours synchronisé,
            <span className="text-primary"> automatiquement</span>
          </h3>
          <p className="mt-6 text-muted-foreground md:text-lg">
            Que vous soyez à la maison ou au magasin, vos listes et recettes
            sont toujours à jour. Votre conjoint ajoute un plat ? Vous le voyez
            immédiatement !
          </p>
        </div>
      </PageContainer>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "Est-ce que je peux ajouter n'importe quel ingrédient ?",
      a: "Vous pouvez créer tous les produits que vous voulez. L'application vous aide à éviter les doublons pour garder vos listes bien organisées.",
    },
    {
      q: 'Comment éviter d\'avoir "tomate" et "tomates" ?',
      a: "L'application détecte automatiquement les produits similaires et vous propose de les fusionner.",
    },
    {
      q: "Que se passe-t-il si j'utilise différentes unités ?",
      a: "Pas de problème ! Vous pouvez utiliser grammes, kilos, pièces... L'application s'adapte à vos habitudes.",
    },
    {
      q: 'Puis-je ajouter des produits non-alimentaires ?',
      a: "Bien sûr ! Produits d'entretien, hygiène... Tout peut être ajouté à vos listes.",
    },
    {
      q: 'Mes données sont-elles en sécurité ?',
      a: 'Absolument. Vos recettes et listes vous appartiennent et restent privées.',
    },
  ];

  return (
    <section id="faq" className="bg-muted/30 border-t">
      <PageContainer className="py-24">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-semibold text-3xl md:text-4xl tracking-tight">
            Questions
            <span className="text-primary"> fréquentes</span>
          </h2>
        </div>
        <div className="space-y-6 mx-auto max-w-4xl">
          {faqs.map((f) => (
            <Card
              key={f.q}
              className="bg-card/60 hover:shadow-lg backdrop-blur-sm border-l-4 border-l-primary transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="text-base">{f.q}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                {f.a}
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
      <div className="top-0 right-0 absolute bg-primary/5 blur-3xl w-1/3 h-full" />
      <div className="bottom-0 left-0 absolute bg-primary/10 blur-3xl w-1/3 h-full" />
      <PageContainer className="py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 bg-secondary/10 shadow-sm mb-6 px-4 py-2 border border-secondary/20 rounded-full font-medium text-secondary text-sm">
            <Sparkles className="w-4 h-4" />
            Rejoignez des milliers de familles satisfaites
          </div>
          <h2 className="font-semibold text-3xl md:text-4xl tracking-tight">
            Prêt à simplifier vos
            <span className="text-primary"> courses</span> ?
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Rejoignez les familles qui ont déjà simplifié leur organisation en
            cuisine. C'est gratuit et ça ne prend que 2 minutes !
          </p>
          <div className="flex sm:flex-row flex-col justify-center items-center gap-4 mt-8">
            <Authenticated>
              <Link
                to="/dashboard"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 duration-300',
                )}
              >
                Mon compte
              </Link>
            </Authenticated>
            <Unauthenticated>
              <Link
                to="/login"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 duration-300',
                )}
              >
                Commencer maintenant
              </Link>
            </Unauthenticated>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-muted/20 border-t">
      <PageContainer className="flex md:flex-row flex-col md:justify-between md:items-center gap-6 py-12">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <div className="flex justify-center items-center bg-primary rounded w-4 h-4 text-primary-foreground">
            <ChefHat className="w-2.5 h-2.5" />
          </div>
          <span>Cuistot et Chariot © {new Date().getFullYear()}</span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground text-xs">
          <a
            href="#fonctionnalites"
            className="hover:text-primary transition-colors"
          >
            Comment ça marche
          </a>
          <a href="#avantages" className="hover:text-primary transition-colors">
            Avantages
          </a>
          <a href="#faq" className="hover:text-primary transition-colors">
            Questions
          </a>
        </nav>
      </PageContainer>
    </footer>
  );
}
