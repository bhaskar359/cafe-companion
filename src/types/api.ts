export type CategoryType = 'all' | 'specialty' | 'chai' | 'bakery' | 'small-plates' | 'vegan';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  pricePaise: number;
  category: string;
  tags: string[];
  isAvailable: boolean;
  imageUrl?: string;
  roastOrigin?: string;
  cuppingScore?: number;
}

export interface RecommendationItem {
  menuItemId: string;
  name: string;
  pricePaise: number;
  rationale: string;
  pairingSuggestion?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
}

export interface RecommendationResponse {
  recommendations: RecommendationItem[];
  sensorySummary?: string;
  fallbackUsed?: boolean;
}

export interface OrderPreviewItemInput {
  menuItemId: string;
  quantity: number;
  customizations?: string[];
}

export interface OrderPreviewItem {
  menuItemId: string;
  name: string;
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
  customizations?: string[];
  isAvailable: boolean;
  imageUrl?: string;
}

export interface OrderPreview {
  previewId: string;
  items: OrderPreviewItem[];
  subtotalPaise: number;
  packagingFeePaise: number;
  fairTradeSurchargePaise: number;
  gstPaise: number;
  totalPaise: number;
  handoffMethod: 'dine_in' | 'counter' | 'curbside';
  tableOrNotes?: string;
  estimatedMinutes: number;
  expiresAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  itemName: string;
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
  customizations?: string[];
}

export type OrderStatus = 'received' | 'brewing' | 'ready' | 'completed';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  stage: number; // 1 to 4
  stageDescription: string;
  subtotalPaise: number;
  packagingFeePaise: number;
  fairTradeSurchargePaise: number;
  gstPaise: number;
  totalPaise: number;
  items: OrderItem[];
  handoffMethod: 'dine_in' | 'counter' | 'curbside';
  notes?: string;
  customerName?: string;
  estimatedMinutesLeft: number;
  targetReadyTime: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  time?: string;
  authorName?: string;
  recommendedItems?: MenuItem[];
  orderPreview?: OrderPreview;
  toolsUsed?: string[];
  fallbackUsed?: boolean;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
