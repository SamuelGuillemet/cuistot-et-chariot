import { api } from '@api/api';
import {
  type ChatMiddleware,
  chat,
  toServerSentEventsResponse,
} from '@tanstack/ai';
import { openRouterText } from '@tanstack/ai-openrouter';
import { createFileRoute } from '@tanstack/react-router';
import { getCookie } from '@tanstack/react-start/server';
import { ConvexHttpClient } from 'convex/browser';
import { ICON_DATA } from '@/components/food-icons/icon-food-font-config';
import { createRecipeDef, getIconsDef, getProductsDef } from '@/lib/ai-tools';
import { getToken } from '@/lib/auth-server';

// ─── Logging middleware ───
const loggingMiddleware: ChatMiddleware = {
  name: 'logging',
  onStart(ctx) {
    console.log(
      `[AI] 🚀 Chat started: requestId=${ctx.requestId}, model=${ctx.model}`,
    );
  },
  onBeforeToolCall(_ctx, { toolName, args }) {
    console.log(`[AI] ⚙️  Tool call: ${toolName}`, JSON.stringify(args));
    return undefined; // proceed
  },
  onAfterToolCall(_ctx, { toolName, ok, result, error, duration }) {
    if (ok) {
      console.log(
        `[AI] ✅ Tool result: ${toolName} (${duration}ms)`,
        JSON.stringify(result).slice(0, 500),
      );
    } else {
      console.error(`[AI] ❌ Tool failed: ${toolName} (${duration}ms)`, error);
    }
  },
  onToolPhaseComplete(_ctx, info) {
    console.log('[AI] 🔧 Tool phase complete:', {
      results: info.results.length,
      needsApproval: info.needsApproval.length,
      needsClientExecution: info.needsClientExecution.length,
    });
  },
  onChunk(_ctx, chunk) {
    // Log non-text chunks for debugging
    if (chunk.type !== 'TEXT_MESSAGE_CONTENT') {
      console.log(
        `[AI] 📦 Chunk: ${chunk.type}`,
        JSON.stringify(chunk).slice(0, 200),
      );
    }
  },
  onFinish(_ctx, { finishReason, content, duration }) {
    console.log(
      `[AI] 🏁 Finished: reason=${finishReason}, duration=${duration}ms, content length=${content?.length ?? 0}`,
    );
    if (content) {
      console.log('[AI] 📝 Content preview:', content.slice(0, 300));
    }
  },
  onError(_ctx, { error }) {
    console.error('[AI] ❌ Error:', error);
  },
};

const HOUSEHOLD_COOKIE_NAME = 'household-id';

function buildTools(convexClient: ConvexHttpClient, publicId: string) {
  // Server tool: returns available food icons, optionally filtered by category
  const getIcons = getIconsDef.server(async (input) => {
    const args = input as { category?: string } | null;
    const icons = args?.category
      ? ICON_DATA.filter((icon) => icon.category === args.category)
      : ICON_DATA;
    console.log(`[AI] 🎨 get_icons returned ${icons.length} icons`);
    return icons.map((icon) => ({
      id: icon.id,
      name: icon.name,
      category: icon.category,
    }));
  });

  // Server tool: silently fetches products
  const getProducts = getProductsDef.server(async () => {
    try {
      const products = await convexClient.query(
        api.products.queries.getProducts,
        { publicId },
      );
      const mapped = products.map((p) => ({
        id: p._id,
        name: p.name,
        category: p.category,
        defaultUnit: p.defaultUnit,
      }));
      console.log(`[AI] 📦 get_products returned ${mapped.length} products`);
      return mapped;
    } catch (err) {
      console.error('[AI] ❌ get_products failed:', err);
      throw err;
    }
  });

  // createRecipeDef is passed as definition only — client will execute it
  return [getIcons, getProducts, createRecipeDef];
}

export const Route = createFileRoute('/api/chat' as never)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        if (!openRouterKey) {
          return new Response(
            JSON.stringify({ error: 'OPENROUTER_API_KEY non configurée' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          );
        }

        const token = await getToken();
        if (!token) {
          return new Response(JSON.stringify({ error: 'Non authentifié' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const publicId = getCookie(HOUSEHOLD_COOKIE_NAME);
        if (!publicId) {
          return new Response(
            JSON.stringify({ error: 'Aucun foyer sélectionné' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          );
        }

        const { messages, conversationId } = await request.json();

        const convexClient = new ConvexHttpClient(
          process.env.VITE_CONVEX_URL ?? '',
        );
        convexClient.setAuth(token);

        try {
          const stream = chat({
            adapter: openRouterText('openai/gpt-oss-120b:free'),
            messages,
            conversationId,
            systemPrompts: [
              `Tu es un assistant culinaire intelligent qui aide à créer des recettes.
Tu parles en français. Formate tes réponses en Markdown (titres, listes, gras).
Tu disposes de trois outils :
- get_products : pour lister les ingrédients disponibles dans le foyer
- get_icons : pour obtenir la liste des icônes disponibles pour les produits (filtre par catégorie si possible)
- create_recipe : pour enregistrer une recette (nécessite validation de l'utilisateur)

Workflow :
1. Appelle get_products pour connaître les ingrédients disponibles.
2. Propose une recette en distinguant les ingrédients déjà disponibles (existingProducts) et ceux à créer (newProducts).
3. Quand l'utilisateur confirme, appelle get_icons pour trouver les icônes des nouveaux produits, puis appelle create_recipe.
4. L'utilisateur verra une popup de validation avant la création.
5. Après validation, confirme la création.

Pour les nouveaux produits, utilise TOUJOURS get_icons pour trouver l'icône la plus pertinente (utilise 'default' seulement si aucune icône ne correspond).
Sois conversationnel et enthousiaste sur la cuisine.

N'inclut jamais les id des produits ou des icônes dans tes messages à l'utilisateur, ce sont des détails d'implémentation.
`,
            ],
            tools: buildTools(convexClient, publicId),
          });

          return toServerSentEventsResponse(stream);
        } catch (error) {
          return new Response(
            JSON.stringify({
              error: error instanceof Error ? error.message : 'Erreur inconnue',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          );
        }
      },
    },
  },
});
