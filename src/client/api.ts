import { MenuItem, Order, OrderPreview, RecommendationResponse, ChatMessage } from '../types/api.ts';
import { MOCK_MENU_ITEMS, getMockRecommendations } from './mockData.ts';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

// Helper to handle API errors cleanly
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Server error (${res.status})`;
    try {
      const errorData = await res.json();
      if (errorData?.error?.message) {
        errorMsg = errorData.error.message;
      }
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  async getHealth(): Promise<{ status: string; database: string; gemini: string }> {
    if (USE_MOCK) {
      return { status: 'healthy', database: 'mock-local', gemini: 'mock' };
    }
    const res = await fetch('/api/v1/health');
    return handleResponse(res);
  },

  async getMenu(filters?: { category?: string; search?: string; maxPricePaise?: number }): Promise<MenuItem[]> {
    if (USE_MOCK) {
      return MOCK_MENU_ITEMS.filter(item => {
        if (filters?.category && filters.category !== 'all') {
          if (filters.category === 'vegan') {
            if (!item.tags.includes('vegan') && item.category !== 'vegan') return false;
          } else if (item.category !== filters.category) {
            return false;
          }
        }
        if (filters?.maxPricePaise && item.pricePaise > filters.maxPricePaise) return false;
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          return item.name.toLowerCase().includes(s) || item.description.toLowerCase().includes(s);
        }
        return true;
      });
    }

    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.maxPricePaise) params.set('maxPricePaise', filters.maxPricePaise.toString());

    const url = `/api/v1/menu${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    const data = await handleResponse<{ items: MenuItem[] }>(res);
    return data.items;
  },

  async getMenuItem(id: string): Promise<MenuItem> {
    if (USE_MOCK) {
      const match = MOCK_MENU_ITEMS.find(i => i.id === id);
      if (!match) throw new Error('Item not found in mock store');
      return match;
    }

    const res = await fetch(`/api/v1/menu/${id}`);
    const data = await handleResponse<{ item: MenuItem }>(res);
    return data.item;
  },

  async addMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const res = await fetch('/api/v1/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const data = await handleResponse<{ item: MenuItem }>(res);
    return data.item;
  },

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const res = await fetch(`/api/v1/menu/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await handleResponse<{ item: MenuItem }>(res);
    return data.item;
  },

  async getRecommendations(query: string, dietary?: string, maxPricePaise?: number): Promise<RecommendationResponse> {
    if (USE_MOCK) {
      return getMockRecommendations(query);
    }

    const res = await fetch('/api/v1/ai/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, dietary, maxPricePaise })
    });
    return handleResponse<RecommendationResponse>(res);
  },

  async chatWithAgent(message: string, history?: Array<{ role: 'user' | 'model'; content: string }>): Promise<{
    reply: string;
    toolsUsed?: string[];
    recommendedItems?: MenuItem[];
    orderPreview?: OrderPreview | null;
    fallbackUsed?: boolean;
  }> {
    if (USE_MOCK) {
      const recs = getMockRecommendations(message);
      return {
        reply: `Splendid choice! For your request, I recommend our ${recs.recommendations[0]?.name}. Freshly extracted and lightly spiced.`,
        toolsUsed: ['search_menu (mock)'],
        recommendedItems: MOCK_MENU_ITEMS.slice(0, 2),
        orderPreview: null,
        fallbackUsed: true
      };
    }

    const res = await fetch('/api/v1/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });
    return handleResponse(res);
  },

  async previewOrder(
    items: Array<{ menuItemId: string; quantity: number; customizations?: string[] }>,
    handoffMethod: 'dine_in' | 'counter' | 'curbside' = 'counter',
    tableOrNotes?: string
  ): Promise<OrderPreview> {
    if (USE_MOCK) {
      let subtotal = 0;
      const previewItems = items.map(input => {
        const found = MOCK_MENU_ITEMS.find(m => m.id === input.menuItemId) || MOCK_MENU_ITEMS[0];
        const lineTotal = found.pricePaise * input.quantity;
        subtotal += lineTotal;
        return {
          menuItemId: found.id,
          name: found.name,
          unitPricePaise: found.pricePaise,
          quantity: input.quantity,
          lineTotalPaise: lineTotal,
          customizations: input.customizations,
          isAvailable: true,
          imageUrl: found.imageUrl
        };
      });

      const fairTradeSurchargePaise = 2000;
      const gstPaise = Math.round(subtotal * 0.05);
      return {
        previewId: `mock_prev_${Date.now()}`,
        items: previewItems,
        subtotalPaise: subtotal,
        packagingFeePaise: 0,
        fairTradeSurchargePaise,
        gstPaise,
        totalPaise: subtotal + fairTradeSurchargePaise + gstPaise,
        handoffMethod,
        tableOrNotes,
        estimatedMinutes: 8,
        expiresAt: new Date(Date.now() + 15 * 60000).toISOString()
      };
    }

    const res = await fetch('/api/v1/orders/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, handoffMethod, tableOrNotes })
    });
    return handleResponse<OrderPreview>(res);
  },

  async confirmOrder(
    previewId: string,
    confirmed: boolean,
    options?: { customerName?: string; notes?: string }
  ): Promise<Order> {
    if (USE_MOCK) {
      if (!confirmed) {
        throw new Error('Customer confirmation required before order placement.');
      }
      return {
        id: `mock_ord_${Date.now()}`,
        orderNumber: 'CC-8429',
        status: 'brewing',
        stage: 2,
        stageDescription: 'Extraction & Grinding',
        subtotalPaise: 35000,
        packagingFeePaise: 0,
        fairTradeSurchargePaise: 2000,
        gstPaise: 1750,
        totalPaise: 38750,
        items: [],
        handoffMethod: 'counter',
        notes: options?.notes || 'Barista Counter Pick-up',
        customerName: options?.customerName || 'Tasting Guest',
        estimatedMinutesLeft: 8,
        targetReadyTime: '08:51 AM IST',
        createdAt: new Date().toISOString()
      };
    }

    const res = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        previewId,
        confirmed,
        customerName: options?.customerName,
        notes: options?.notes
      })
    });
    const data = await handleResponse<{ order: Order }>(res);
    return data.order;
  },

  async getOrder(orderId: string): Promise<Order> {
    if (USE_MOCK) {
      return {
        id: orderId,
        orderNumber: 'CC-8429',
        status: 'brewing',
        stage: 2,
        stageDescription: 'Extraction & Grinding',
        subtotalPaise: 59000,
        packagingFeePaise: 0,
        fairTradeSurchargePaise: 5250,
        gstPaise: 2950,
        totalPaise: 67200,
        items: [],
        handoffMethod: 'counter',
        estimatedMinutesLeft: 8,
        targetReadyTime: '08:51 AM IST',
        createdAt: new Date().toISOString()
      };
    }

    const res = await fetch(`/api/v1/orders/${orderId}`);
    const data = await handleResponse<{ order: Order }>(res);
    return data.order;
  }
};
