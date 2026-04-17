import { api } from '@api/api';
import type { ProductUnit, RecipeDifficulty } from '@backend/types';
import { useConvexMutation } from '@convex-dev/react-query';
import { clientTools, createChatClientOptions } from '@tanstack/ai-client';
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BotIcon,
  CheckIcon,
  ChefHatIcon,
  Loader2Icon,
  SendIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createRecipeDef } from '@/lib/ai-tools';
import { cn } from '@/lib/utils';

// ─── Approval Card ───

interface RecipeApprovalData {
  name: string;
  instructions: Array<{ order: number; text: string }>;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: RecipeDifficulty;
  existingProducts: Array<{
    productId: string;
    quantity: number;
    unit: ProductUnit;
  }>;
  newProducts: Array<{
    name: string;
    category: string;
    quantity: number;
    unit: ProductUnit;
  }>;
}

function RecipeApprovalCard({
  data,
  onApprove,
  onDeny,
}: {
  data: RecipeApprovalData;
  onApprove: () => void;
  onDeny: () => void;
}) {
  const difficultyLabels = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
  };

  return (
    <div className="border border-amber-300 dark:border-amber-700 rounded-lg p-3 bg-amber-50 dark:bg-amber-950/30 space-y-3">
      <div className="flex items-center gap-2 font-semibold text-sm">
        <ChefHatIcon className="size-4 text-amber-600" />
        <span>Créer la recette : {data.name} ?</span>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          {data.servings} portions · {data.prepTime} min prépa · {data.cookTime}{' '}
          min cuisson · {difficultyLabels[data.difficulty] ?? data.difficulty}
        </p>
        <p>{data.instructions.length} étapes</p>
        {data.existingProducts.length > 0 && (
          <p>{data.existingProducts.length} ingrédient(s) existant(s)</p>
        )}
        {data.newProducts.length > 0 && (
          <p className="text-amber-600 dark:text-amber-400">
            + {data.newProducts.length} nouveau(x) produit(s) à créer :{' '}
            {data.newProducts.map((p) => p.name).join(', ')}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="gap-1.5" onClick={onApprove}>
          <CheckIcon className="size-3" />
          Créer la recette
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={onDeny}
        >
          <XIcon className="size-3" />
          Annuler
        </Button>
      </div>
    </div>
  );
}

// ─── Tool Call Badge ───

function ToolCallBadge({ toolName }: { toolName: string }) {
  const labels: Record<string, string> = {
    get_products: 'Consultation des ingrédients...',
    get_icons: 'Recherche des icônes...',
    create_recipe: 'Préparation de la recette...',
  };
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground text-xs italic">
      <Loader2Icon className="size-3 animate-spin" />
      <span>{labels[toolName] ?? `Outil : ${toolName}`}</span>
    </div>
  );
}

// ─── Message Bubble ───

function MessageBubble({
  role,
  parts,
  onApprove,
  onDeny,
}: {
  role: 'user' | 'assistant';
  parts: Array<{
    type: string;
    content?: string;
    toolName?: string;
    name?: string;
    state?: string;
    approval?: { id: string };
    arguments?: string;
    input?: Record<string, unknown>;
  }>;
  onApprove?: (approvalId: string) => void;
  onDeny?: (approvalId: string) => void;
}) {
  const isUser = role === 'user';

  return (
    <div
      className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {!isUser && (
        <div className="shrink-0 flex items-start justify-center bg-primary/10 rounded-full size-7 mt-0.5">
          <BotIcon className="size-4 text-primary mt-1.5" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted rounded-tl-sm',
        )}
      >
        {parts.map((part, idx) => {
          if (part.type === 'text' && part.content) {
            return (
              <div
                key={idx}
                className="prose prose-sm dark:prose-invert max-w-none leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_strong]:font-semibold [&_ul]:pl-4 [&_ol]:pl-4"
              >
                {part.content}
                {/*                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
                </ReactMarkdown> */}
              </div>
            );
          }
          // thinking parts are intentionally hidden from the UI
          if (
            part.type === 'tool-call' &&
            part.name === 'create_recipe' &&
            part.state === 'approval-requested' &&
            part.approval &&
            (part.input ?? part.arguments)
          ) {
            const recipeData = (part.input ??
              (part.arguments
                ? JSON.parse(part.arguments)
                : null)) as RecipeApprovalData | null;
            if (!recipeData) return null;
            return (
              <RecipeApprovalCard
                key={idx}
                data={recipeData}
                onApprove={() => onApprove?.(part.approval?.id ?? '')}
                onDeny={() => onDeny?.(part.approval?.id ?? '')}
              />
            );
          }
          if (part.type === 'tool-call' && (part.toolName || part.name)) {
            return (
              <ToolCallBadge
                key={idx}
                toolName={part.toolName ?? part.name ?? 'unknown'}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───

const STARTER_PROMPTS = [
  "Qu'est-ce que je peux cuisiner avec mes ingrédients ?",
  'Propose-moi une recette facile pour ce soir',
  'Crée une recette végétarienne',
];

export function RecipeChatbot({ householdId }: { householdId: string }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { mutateAsync: createRecipeWithProducts } = useMutation({
    mutationFn: useConvexMutation(
      api.recipes.aiMutations.createRecipeWithProducts,
    ),
    onSuccess: () => {
      toast.success('Recette créée avec succès !');
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création');
    },
  });

  // Client tool: executes the Convex mutation when approved
  const createRecipeClient = createRecipeDef.client(async (recipeInput) => {
    const result = await createRecipeWithProducts({
      ...(recipeInput as Record<string, unknown> as Parameters<
        typeof createRecipeWithProducts
      >[0]),
      publicId: householdId,
    });
    return result;
  });

  const tools = clientTools(createRecipeClient);

  const chatOptions = createChatClientOptions({
    connection: fetchServerSentEvents('/api/chat'),
    tools,
  });

  const { messages, sendMessage, isLoading, addToolApprovalResponse } =
    useChat(chatOptions);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed);
    setInput('');
  };

  const handleStarterPrompt = (prompt: string) => {
    if (isLoading) return;
    sendMessage(prompt);
  };

  const handleApprove = (approvalId: string) => {
    addToolApprovalResponse({ id: approvalId, approved: true });
  };

  const handleDeny = (approvalId: string) => {
    addToolApprovalResponse({ id: approvalId, approved: false });
  };

  return (
    <div className="flex flex-col h-full border rounded-xl bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-center bg-primary/10 rounded-full size-8">
          <ChefHatIcon className="size-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">
            Assistant recettes
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Propulsé par IA via OpenRouter
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
          En ligne
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-4 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex items-center justify-center bg-primary/10 rounded-full size-12">
                <SparklesIcon className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  Bonjour ! Je suis ton assistant culinaire.
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Je peux consulter tes ingrédients et créer des recettes
                  directement dans l'app.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleStarterPrompt(prompt)}
                    className="text-xs text-left px-3 py-2 rounded-lg border border-dashed hover:bg-accent hover:border-solid transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                role={message.role as 'user' | 'assistant'}
                parts={
                  message.parts as Parameters<typeof MessageBubble>[0]['parts']
                }
                onApprove={handleApprove}
                onDeny={handleDeny}
              />
            ))
          )}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-2.5">
              <div className="flex items-start justify-center bg-primary/10 rounded-full size-7 mt-0.5">
                <BotIcon className="size-4 text-primary mt-1.5" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                <div className="flex gap-1 items-center h-5">
                  <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                  <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                  <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 px-4 py-3 border-t bg-background"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Décris une recette ou pose une question..."
          disabled={isLoading}
          className="flex-1"
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
          {isLoading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <SendIcon className="size-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
