import { GoogleGenAI, Type, type FunctionDeclaration } from '@google/genai';
import { db } from './db/index.ts';
import type { MenuItem, OrderPreview } from '../types/api.ts';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

const searchMenuDeclaration: FunctionDeclaration = {
  name: 'search_menu',
  description: 'Search available real cafe menu items by search text, optional category, and optional maximum price in paise.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchText: {
        type: Type.STRING,
        description: 'Keyword search query such as cold brew, pour over, croissant, vegan, light roast'
      },
      category: {
        type: Type.STRING,
        description: 'Optional category: specialty, chai, bakery, small-plates, vegan'
      },
      maxPricePaise: {
        type: Type.INTEGER,
        description: 'Optional maximum price in integer paise (e.g. 20000 for ₹200)'
      }
    }
  }
};

const previewOrderDeclaration: FunctionDeclaration = {
  name: 'preview_order',
  description: 'Validate menu items against the database, calculate totals deterministically, and return a reviewable order preview. NEVER creates an order.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        description: 'Array of items with menuItemId and quantity',
        items: {
          type: Type.OBJECT,
          properties: {
            menuItemId: { type: Type.STRING, description: 'ID of the menu item' },
            quantity: { type: Type.INTEGER, description: 'Quantity (must be at least 1)' }
          },
          required: ['menuItemId', 'quantity']
        }
      }
    },
    required: ['items']
  }
};

// Deterministic fallback for recommendations when Gemini is unavailable or rate-limited
export async function getDeterministicRecommendations(query: string, maxPricePaise?: number) {
  const q = query.toLowerCase();
  const allItems = await db.getMenuItems();
  
  // Keyword scoring
  const scored = allItems.map(item => {
    let score = 0;
    const nameL = item.name.toLowerCase();
    const descL = item.description.toLowerCase();
    const tagsL = item.tags.map(t => t.toLowerCase());

    if (maxPricePaise && item.pricePaise <= maxPricePaise) score += 3;
    if (q.includes('under') && (q.includes('200') || q.includes('₹200')) && item.pricePaise <= 20000) score += 4;
    if (q.includes('cold') || q.includes('iced')) {
      if (tagsL.includes('cold') || nameL.includes('cold') || nameL.includes('iced') || nameL.includes('frappé')) score += 5;
    }
    if (q.includes('sweet') || q.includes('not too sweet') || q.includes('sugar')) {
      if (tagsL.includes('sugar-free') || tagsL.includes('low-sugar') || tagsL.includes('unrefined-sugar')) score += 4;
    }
    if (q.includes('vegan') || q.includes('dairy-free') || q.includes('oat')) {
      if (tagsL.includes('vegan') || tagsL.includes('oat-milk')) score += 4;
    }
    if (q.includes('breakfast') || q.includes('snack') || q.includes('toast')) {
      if (item.category === 'small-plates' || item.category === 'bakery') score += 4;
    }
    if (q.includes('pour-over') || q.includes('single origin')) {
      if (tagsL.includes('single-origin') || nameL.includes('pour-over')) score += 5;
    }
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topMatches = scored.slice(0, 2).map(s => s.item);

  return {
    recommendations: topMatches.map(item => ({
      menuItemId: item.id,
      name: item.name,
      pricePaise: item.pricePaise,
      rationale: `${item.roastOrigin || item.category}: ${item.description}`,
      pairingSuggestion: 'Roasted Almond Biscotti (+₹60)',
      category: item.category,
      tags: item.tags,
      imageUrl: item.imageUrl
    })),
    sensorySummary: 'Low natural acidity with gentle sweetness calibrated for a refreshing focus.',
    fallbackUsed: true
  };
}

// Generate recommendations via Gemini or deterministic fallback
export async function generateRecommendations(query: string, dietary?: string, maxPricePaise?: number) {
  const client = getAiClient();
  if (!client) {
    return getDeterministicRecommendations(query, maxPricePaise);
  }

  try {
    const availableItems = await db.getMenuItems({ maxPricePaise });
    const menuSnippet = availableItems.map(i => ({
      id: i.id,
      name: i.name,
      price: `₹${(i.pricePaise / 100).toFixed(0)}`,
      pricePaise: i.pricePaise,
      category: i.category,
      tags: i.tags,
      description: i.description
    }));

    const prompt = `You are the lead sensory barista at Café Companion, an artisanal Indian specialty café.
User Query: "${query}"
Dietary Preference: "${dietary || 'None specified'}"
Max Price Limit: ${maxPricePaise ? `₹${maxPricePaise / 100}` : 'None'}

Here is the exact real menu:
${JSON.stringify(menuSnippet, null, 2)}

Pick 1 to 2 best matching items strictly from the menu above.
Provide a concise JSON response strictly following this format:
{
  "recommendations": [
    {
      "menuItemId": "exact uuid from menu",
      "name": "item name",
      "pricePaise": 19000,
      "rationale": "1 short sentence why it matches the customer's craving",
      "pairingSuggestion": "A pastry or savory pairing"
    }
  ],
  "sensorySummary": "1 short sentence describing the flavor notes"
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) {
      return getDeterministicRecommendations(query, maxPricePaise);
    }

    const parsed = JSON.parse(text);
    return {
      recommendations: parsed.recommendations || [],
      sensorySummary: parsed.sensorySummary || '',
      fallbackUsed: false
    };
  } catch (error) {
    console.warn('[Gemini] Recommendation generation error, falling back to deterministic:', (error as Error).message);
    return getDeterministicRecommendations(query, maxPricePaise);
  }
}

// Agent Chat with exactly two tools: search_menu and preview_order
export async function chatWithAgent(message: string, history: Array<{ role: 'user' | 'model'; content: string }> = []) {
  const client = getAiClient();
  if (!client) {
    // Return high-quality deterministic response
    const recs = await getDeterministicRecommendations(message);
    const itemNames = recs.recommendations.map(r => `${r.name} (₹${r.pricePaise / 100})`).join(' and ');
    return {
      reply: `Splendid choice! Based on your request, I recommend ${itemNames || 'our South Indian Filter Coffee Frappé'}. Both are prepared fresh from single-estate harvests.`,
      toolsUsed: ['search_menu (offline)'],
      recommendedItems: await Promise.all(recs.recommendations.map(r => db.getMenuItemById(r.menuItemId))).then(list => list.filter(Boolean) as MenuItem[]),
      orderPreview: null,
      fallbackUsed: true
    };
  }

  try {
    const toolsUsed: string[] = [];
    let recommendedItems: MenuItem[] = [];
    let orderPreview: OrderPreview | null = null;

    // Build contents from history and current message
    const formattedHistory = history.slice(-4).map(h => ({
      role: h.role,
      parts: [{ text: h.content }]
    }));

    const systemInstruction = `You are Concierge Sravan, an estate sensory specialist at Café Companion (an artisanal Indian specialty coffee roastery).
You have access to exactly two tools:
1. 'search_menu' - to find real available items in the café.
2. 'preview_order' - to compute an accurate order preview and validate items. Note: This NEVER creates an order. Customer must review first.

Rules:
- Speak with warm Indian hospitality, culinary elegance, and sensory knowledge.
- Keep responses concise (under 3 sentences).
- If the customer asks for drinks or food, use 'search_menu'.
- If the customer asks to order or wants to know the total, use 'preview_order'.
- Never invent menu items or prices. Always ground answers in real tool results.`;

    const contents = [
      ...formattedHistory,
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const turn1 = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
        tools: [{ functionDeclarations: [searchMenuDeclaration, previewOrderDeclaration] }]
      }
    });

    const functionCalls = turn1.functionCalls;
    if (!functionCalls || functionCalls.length === 0) {
      return {
        reply: turn1.text || 'Namaste! How may I assist your specialty coffee experience today?',
        toolsUsed: [],
        recommendedItems: [],
        orderPreview: null,
        fallbackUsed: false
      };
    }

    // Process tool calls
    const toolCall = functionCalls[0];
    if (toolCall.name) {
      toolsUsed.push(toolCall.name);
    }

    let functionResponseResult: any = null;

    if (toolCall.name === 'search_menu') {
      const args = (toolCall.args || {}) as any;
      const results = await db.getMenuItems({
        search: args.searchText,
        category: args.category,
        maxPricePaise: args.maxPricePaise
      });
      recommendedItems = results.slice(0, 3);
      functionResponseResult = {
        foundItemsCount: recommendedItems.length,
        items: recommendedItems.map(i => ({
          id: i.id,
          name: i.name,
          pricePaise: i.pricePaise,
          priceRupees: i.pricePaise / 100,
          category: i.category,
          tags: i.tags
        }))
      };
    } else if (toolCall.name === 'preview_order') {
      const args = (toolCall.args || {}) as any;
      const items = (args.items || []) as Array<{ menuItemId: string; quantity: number }>;
      orderPreview = await db.createOrderPreview(items, 'counter');
      functionResponseResult = {
        previewId: orderPreview.previewId,
        totalRupees: orderPreview.totalPaise / 100,
        subtotalRupees: orderPreview.subtotalPaise / 100,
        estimatedMinutes: orderPreview.estimatedMinutes,
        itemCount: orderPreview.items.length
      };
    }

    // Second turn to provide natural response back to user
    const turn2 = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        ...contents,
        {
          role: 'model',
          parts: [{ functionCall: toolCall }]
        },
        {
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: toolCall.name,
                response: functionResponseResult
              }
            }
          ]
        }
      ],
      config: {
        systemInstruction,
        temperature: 0.2
      }
    });

    return {
      reply: turn2.text || 'I have curated this selection based on our real estate roastery menu.',
      toolsUsed,
      recommendedItems,
      orderPreview,
      fallbackUsed: false
    };
  } catch (err) {
    console.warn('[Gemini] Agent error, using fallback:', (err as Error).message);
    const recs = await getDeterministicRecommendations(message);
    return {
      reply: `Splendid choice! I recommend our ${recs.recommendations[0]?.name || 'Iced Americano'}. Roasted fresh in small sensory batches.`,
      toolsUsed: ['search_menu (offline)'],
      recommendedItems: await Promise.all(recs.recommendations.map(r => db.getMenuItemById(r.menuItemId))).then(list => list.filter(Boolean) as MenuItem[]),
      orderPreview: null,
      fallbackUsed: true
    };
  }
}
