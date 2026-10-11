import { Pool } from 'pg';
import crypto from 'crypto';
import type { MenuItem, Order, OrderItem, OrderPreview } from '../../types/api.ts';

export interface DatabaseStatus {
  type: 'postgres' | 'in-memory';
  connected: boolean;
  itemCount: number;
}

// Initial deterministic seed data
const SEED_MENU_ITEMS: MenuItem[] = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    name: 'South Indian Filter Coffee Frappé',
    description: 'Dark roasted chicory blend shaken with whole dairy milk, chilled crushed ice, and topped with velvety organic palm jaggery foam.',
    pricePaise: 19000,
    category: 'specialty',
    tags: ['veg', 'house-favorite', 'cold', 'under-200', 'chikmagalur'],
    isAvailable: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMIKA2bS52C7_sunXUmE9hNU_PybIy3l8UZ9pYR2khccjAFOpani9NNrTj7FMi7U7ZR5xXAr2OlPITVmv3WxMmvGIHZEjs2qMNHEoH_NIU2ew06Uzk9djJrUDAF0qUCgYuMERqO540m9D-OVhEHT3MK2zWJOyzilSnYHbuIOxJzWhDjeWIi5P7g47E3d7e1Uchu0xYYVRwtm-Y62h5ROKbz_dLhX04P9vQPZ_h9KMLUWYlCFb5R5E3',
    roastOrigin: 'Attikan Micro-Lot (Biligirirangana Hills)',
    cuppingScore: 86.5
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    name: 'Estate Pour-Over (Attikan)',
    description: 'Chemex extraction with cupping notes of toasted almond, single-origin cacao nibs, and subtle wild black cherry sweetness.',
    pricePaise: 22000,
    category: 'specialty',
    tags: ['vegan', 'sugar-free', 'hot', 'single-origin', 'attikan'],
    isAvailable: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB45AJ2j5LGj1sBzRoLq3KeOy-IVtC2lEY3E7h2EtJBd-lq0wSB7YRSw3JA94CZ86rHvcXochLk_GwAH-bnrQ5Sd8enw7R_w0S_zlusdhXFoRK48ajClWeTAlDcSWK7BmetZOuhcrxIae4jnkPkbheYPIJ8YjSy0RgEnVin-v7L7xhh0LIpeLsTqC4z59DlpL_hyQhZOwbi0tu6cyR-LkEJHMddcqFa3573n6aC8OulJJIXHljYLY26',
    roastOrigin: 'Attikan Estate Yellow Honey Process',
    cuppingScore: 87.2
  },
  {
    id: 'a1000000-0000-0000-0000-000000000003',
    name: 'Saffron Cardamom Cold Brew',
    description: 'Steeped slowly for 18 hours in cold mountain water, micro-infused with genuine Pampore saffron threads and fragrant Idukki green cardamom.',
    pricePaise: 24000,
    category: 'chai',
    tags: ['veg', '18h-steep', 'cold', 'zero-waste-bottle', 'shevaroys'],
    isAvailable: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfwm0wD_SLsp5ZQVWtNCjyvF9eUvoPi0kzV2lmutELK5r9gRNz5oLBYdNbuLPfryzOGXMwL0tq0m-ryBGmEo_j82N_ofBWT14RO6FmWHxRYlyfPRRX9HOf9dqc0y-wkI-Pcu-N89uteNtwhLEhWnQjqdKAKlSXt1Fn95wDWmS4-XGH2W3foiQ_TjD6L-5OtTUFBd-J0aDJOqmqznPKj7G0DqKn53mQVyi3cIS5R9sK4TrfB8IAsYGN',
    roastOrigin: 'Shevaroys Single Estate & Pampore Saffron',
    cuppingScore: 88.0
  },
  {
    id: 'a1000000-0000-0000-0000-000000000004',
    name: 'Gunpowder Masala Cheese Toast',
    description: 'Naturally fermented artisanal sourdough topped with melted aged cheddar, fragrant fresh curry leaf tempered butter, and spiced podi masala.',
    pricePaise: 26000,
    category: 'small-plates',
    tags: ['veg', 'chefs-pick', 'artisan-bread', 'breakfast', 'sourdough'],
    isAvailable: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHuejyGXSIhAE6aBRwS-KW3YQ0BNXsaA8QF3ax7U-l80lVI0rJ_ui8j4c4SORbbs8KTvKnO3gx0NoNjE6bc4Qb0KYR0IMtLG80VV52eXcaf1NXDEeGJn-oKw1Kt7cNLmGlzjwyv_FjDLA68w9LsImkki54Bpi-bIHi9E3b8xWnQCY_zWQs2ahOjCYmZjGZAudaqpS_3J-_qpeqccUX1_-qF8tj2azV-M3DDaeqdSRSHEZx_iiPIBb6',
    roastOrigin: 'Artisanal Fermented Bakery'
  },
  {
    id: 'a1000000-0000-0000-0000-000000000005',
    name: 'Jaggery Cold Coffee (Oat Milk)',
    description: 'Double espresso shot shaken vigorously with barista-grade oat milk and unrefined raw Kolhapur sugarcane jaggery for caramel undertones.',
    pricePaise: 19500,
    category: 'specialty',
    tags: ['vegan', 'oat-milk', 'unrefined-sugar', 'cold', 'under-200'],
    isAvailable: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFjnxvfL8Iz0nZ7l3fu1wEb3HPG0n-060F9tqlZY1pX73QVX5WX4hSARafYfTsnCrrQS4J3ninsrYLBHlpMwm2gVeONHpKELWe5NIrh8qHmECLxQ_12w1x2klM6afMwlA83rhdva6NxEis1jYfYbnQrAbmYFMUJZPnGL3RopWwgotuo9vH5tIVehSuuv-ovWYCzxP7qb6L1p7kfU3B3aFpDU9FgtiWnWCtqTk28nzZJOoEI6avCaip',
    roastOrigin: 'Araku Valley Natural Arabica',
    cuppingScore: 85.8
  },
  {
    id: 'a1000000-0000-0000-0000-000000000006',
    name: 'Millet & Dark Chocolate Tea Cake',
    description: 'Slow-baked finger millet (Ragi) flour combined with pure single-origin Idukki 70% chocolate, crowned with sea salt flakes.',
    pricePaise: 18000,
    category: 'bakery',
    tags: ['veg', 'gluten-free', 'kerala-cacao', 'low-sugar', 'under-200'],
    isAvailable: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4g8F6U8agYo8jub-WIBmB0nqN4DJXHNU478OkLmYeM51UWHR4lVyRQQ2VD9Wqs8_GLPC09nNReBcA5-2W7zSfGw1TaMgSNlMiyB_5O7d0g6uuHSej87Dc_Gxbkz98JbNY2N6SdOyawhAj-28-0NmLTWHz7_e7vOO7sqEANU88vWGwnAecn9q6y9-G55hM_1GrB8RtitFtwE7Ug3LO5UoxPYCDYT9Wt0DJqkc_K8opaTagL3R6v1NI',
    roastOrigin: 'Idukki 70% Single Origin Cocoa'
  },
  {
    id: 'a1000000-0000-0000-0000-000000000007',
    name: 'Monsooned Malabar Cold Brew',
    description: '18-hour Dutch drip cold extraction from Malabar coast washed beans with low natural acidity and gentle nutty sweetness.',
    pricePaise: 21000,
    category: 'specialty',
    tags: ['vegan', 'cold', 'low-acidity', 'sugar-free', 'dutch-drip'],
    isAvailable: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPee7Rtc_EmjPFFMNa0mxR1dh1gRaRS3TMOqyZGDZcO8LchDpCzOWN1hIhTD7GrwETD-k_u4T3HLsp2mvnH5JYafe6NJ9LIGekABlVdEmel-sQUejdY873L9jku2wmA5KkhQ3vnFGQqoB6X7n95jkxlXXA0OqfJjqDRa4fsxq4JVjTvzAufoIv-C6vLyus9x_lMdm1syQ6iYpFzExZrHebass9KCytXIKKww7gR2nKaxvK9aApwvYK',
    roastOrigin: 'Malabar Coast Historic Roastery',
    cuppingScore: 86.0
  },
  {
    id: 'a1000000-0000-0000-0000-000000000008',
    name: 'Cardamom Pistachio Croissant',
    description: 'Pure butter sourdough twice-baked pastry sprinkled with vibrant crushed Iranian pistachios and roasted Coorg cardamom seeds.',
    pricePaise: 16000,
    category: 'bakery',
    tags: ['veg', 'pastry', 'warm', 'butter-laminated', 'under-200'],
    isAvailable: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASZO8InaIDYadSKseEtIOkqCNUUi7hFfYixQt3h7pUTcg5GzL5DgzyrfGMm1mrKMoDVz1KdIc8cXNpRj-nNJlKF-bTFjwujLiJK40EvPGR4mWCTM9p0_1zaswwjadK9cRD5WuQmDPpor0eCPtpoiJdr1iGD0vboxodpger6MIjB56Ro3wEvGvoD5lYz8DkO8mM2YjH1mmCihMrCQdc3hpmwpGdbZVNrsI_dKujKCE0luwZaBq3brL-',
    roastOrigin: 'Morning Viennoiserie Kitchen'
  },
  {
    id: 'a1000000-0000-0000-0000-000000000009',
    name: 'Iced Americano',
    description: 'Toasted almond aroma, balanced orange zest finish, and zero refined sugar. Clean double shot espresso over crystal rock ice.',
    pricePaise: 17500,
    category: 'specialty',
    tags: ['vegan', 'sugar-free', 'cold', 'under-200', '84+ specialty'],
    isAvailable: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtHSxzNZabW1cjQmBNeRZb7bRZwLyVuCLzaSyt8KbNRpfbpO2Mzi-0ewqaoZ69Dan03IJS6SOamjFKG32Ta9xR-DdAYNTS2WQPHYCFCWXBmgWBuM88g8_Y6OM42x8cIc-Qj85YGRU4IK_UuOgewehyd1avaGFuKIJt7npUNDFBMJhdTmCoNVCKYXobnzjWzJr2srHLBsObCsZn2h2C_Pn3IFFsF49wTqk3iWPpV1hda9_MF50nPPSQ',
    roastOrigin: 'Chikmagalur Medium Roast',
    cuppingScore: 85.0
  },
  {
    id: 'a1000000-0000-0000-0000-000000000010',
    name: 'Roasted Almond Biscotti',
    description: 'Twice-baked crunchy almond cookie infused with orange zest and wild fennel, perfect for dipping into pour-overs and cold brews.',
    pricePaise: 6000,
    category: 'bakery',
    tags: ['veg', 'pairing-snack', 'under-200', 'biscotti'],
    isAvailable: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPdM3hzDw0nNWnRYmohfdf4_ZBJuT8984aM-u_y_H5CU1Dt32uadXGBbQDF_ManhJw_RjkzP8Vtx5xgINOtNCwJ3-9m36DJxZtovVK91Z5Y9PyT_PUoJ7aRv6CvGZUp7m7e23jbmkWnev9Q5qfUYDT_iFgJqiwS0ZAmjAULFfkZop9s3QKhhLoPPnxM-K1hnEA0N_DIj35cQXs3cbbWuYvcFObrHkuO7XC9Xz7Vf7nXEe01ybUrMBS',
    roastOrigin: 'House Bakehouse'
  }
];

class DatabaseRepository {
  private pool: Pool | null = null;
  private inMemoryMenuItems: MenuItem[] = [...SEED_MENU_ITEMS];
  private inMemoryOrders: Map<string, Order> = new Map();
  private inMemoryPreviews: Map<string, OrderPreview> = new Map();
  private isPostgresConnected: boolean = false;

  constructor() {
    this.initDatabase();
    this.seedDemoOrder();
  }

  private async initDatabase() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('[DB] No DATABASE_URL provided. Using deterministic in-memory store.');
      return;
    }

    try {
      this.pool = new Pool({
        connectionString: dbUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 5000
      });

      this.pool.on('error', (err) => {
        console.warn('[DB] Unexpected error on idle PostgreSQL client:', err.message);
      });

      const client = await this.pool.connect();
      try {
        console.log('[DB] Connected to PostgreSQL. Verifying tables...');
        await client.query(`
          CREATE TABLE IF NOT EXISTS menu_items (
              id UUID PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              description TEXT NOT NULL,
              price_paise INTEGER NOT NULL CHECK (price_paise >= 0),
              category VARCHAR(100) NOT NULL,
              tags TEXT[] NOT NULL DEFAULT '{}',
              is_available BOOLEAN NOT NULL DEFAULT true,
              image_url TEXT,
              roast_origin VARCHAR(255),
              cupping_score NUMERIC(4, 1)
          );
          CREATE TABLE IF NOT EXISTS orders (
              id UUID PRIMARY KEY,
              order_number VARCHAR(64) UNIQUE NOT NULL,
              status VARCHAR(50) NOT NULL DEFAULT 'brewing',
              subtotal_paise INTEGER NOT NULL DEFAULT 0,
              packaging_fee_paise INTEGER NOT NULL DEFAULT 0,
              fair_trade_surcharge_paise INTEGER NOT NULL DEFAULT 0,
              gst_paise INTEGER NOT NULL DEFAULT 0,
              total_paise INTEGER NOT NULL CHECK (total_paise >= 0),
              handoff_method VARCHAR(50) NOT NULL DEFAULT 'counter',
              notes TEXT,
              customer_name VARCHAR(100),
              created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS order_items (
              id UUID PRIMARY KEY,
              order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
              menu_item_id UUID NOT NULL REFERENCES menu_items(id),
              item_name VARCHAR(255) NOT NULL,
              unit_price_paise INTEGER NOT NULL CHECK (unit_price_paise >= 0),
              quantity INTEGER NOT NULL CHECK (quantity > 0),
              line_total_paise INTEGER NOT NULL CHECK (line_total_paise >= 0),
              customizations TEXT[] DEFAULT '{}'
          );
        `);

        // Check if seeded
        const countRes = await client.query('SELECT COUNT(*) FROM menu_items');
        if (parseInt(countRes.rows[0].count, 10) === 0) {
          console.log('[DB] Seeding PostgreSQL menu items...');
          for (const item of SEED_MENU_ITEMS) {
            await client.query(
              `INSERT INTO menu_items (id, name, description, price_paise, category, tags, is_available, image_url, roast_origin, cupping_score)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
               ON CONFLICT (id) DO NOTHING`,
              [
                item.id,
                item.name,
                item.description,
                item.pricePaise,
                item.category,
                item.tags,
                item.isAvailable,
                item.imageUrl || null,
                item.roastOrigin || null,
                item.cuppingScore || null
              ]
            );
          }
        }
        this.isPostgresConnected = true;
        console.log('[DB] PostgreSQL initialization complete.');
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn('[DB] PostgreSQL connection error. Falling back to in-memory store:', (err as Error).message);
      this.isPostgresConnected = false;
      this.pool = null;
    }
  }

  private seedDemoOrder() {
    // Seed initial demo order #CC-8429 to match Stitch screen 4
    const demoOrderId = 'ord_cc8429-demo-indiranagar';
    const demoOrder: Order = {
      id: demoOrderId,
      orderNumber: 'CC-8429',
      status: 'brewing',
      stage: 2,
      stageDescription: 'Extraction & Grinding',
      subtotalPaise: 59000,
      packagingFeePaise: 0,
      fairTradeSurchargePaise: 5250,
      gstPaise: 2950,
      totalPaise: 67200,
      handoffMethod: 'counter',
      customerName: 'Table 04 Express',
      notes: 'Whole milk • 50% Organic Jaggery',
      estimatedMinutesLeft: 8,
      targetReadyTime: '08:51 AM IST',
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'item-demo-1',
          orderId: demoOrderId,
          menuItemId: 'a1000000-0000-0000-0000-000000000001',
          itemName: 'South Indian Filter Coffee Frappé',
          unitPricePaise: 19000,
          quantity: 1,
          lineTotalPaise: 19000,
          customizations: ['Whole Milk', '50% Organic Jaggery']
        },
        {
          id: 'item-demo-2',
          orderId: demoOrderId,
          menuItemId: 'a1000000-0000-0000-0000-000000000008',
          itemName: 'Cardamom Pistachio Croissant',
          unitPricePaise: 16000,
          quantity: 1,
          lineTotalPaise: 16000,
          customizations: ['Warmed slightly']
        },
        {
          id: 'item-demo-3',
          orderId: demoOrderId,
          menuItemId: 'a1000000-0000-0000-0000-000000000003',
          itemName: 'Saffron Cardamom Cold Brew',
          unitPricePaise: 24000,
          quantity: 1,
          lineTotalPaise: 24000,
          customizations: ['Apothecary Flask Deposit']
        }
      ]
    };
    this.inMemoryOrders.set(demoOrderId, demoOrder);
    this.inMemoryOrders.set(demoOrder.orderNumber, demoOrder);
  }

  public async getStatus(): Promise<DatabaseStatus> {
    const items = await this.getMenuItems();
    return {
      type: this.isPostgresConnected ? 'postgres' : 'in-memory',
      connected: true,
      itemCount: items.length
    };
  }

  public async getMenuItems(filters?: { category?: string; search?: string; maxPricePaise?: number }): Promise<MenuItem[]> {
    if (this.isPostgresConnected && this.pool) {
      let query = 'SELECT id, name, description, price_paise as "pricePaise", category, tags, is_available as "isAvailable", image_url as "imageUrl", roast_origin as "roastOrigin", cupping_score as "cuppingScore" FROM menu_items WHERE 1=1';
      const params: any[] = [];

      if (filters?.category && filters.category !== 'all') {
        params.push(filters.category.toLowerCase());
        query += ` AND LOWER(category) = $${params.length}`;
      }

      if (filters?.maxPricePaise) {
        params.push(filters.maxPricePaise);
        query += ` AND price_paise <= $${params.length}`;
      }

      if (filters?.search) {
        params.push(`%${filters.search.toLowerCase()}%`);
        query += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(description) LIKE $${params.length} OR $${params.length} = ANY(tags))`;
      }

      query += ' ORDER BY price_paise ASC';
      const res = await this.pool.query(query, params);
      return res.rows;
    }

    // In-memory deterministic filter
    return this.inMemoryMenuItems.filter(item => {
      if (filters?.category && filters.category !== 'all') {
        if (filters.category === 'vegan') {
          if (!item.tags.includes('vegan') && item.category !== 'vegan') return false;
        } else if (item.category !== filters.category) {
          return false;
        }
      }

      if (filters?.maxPricePaise && item.pricePaise > filters.maxPricePaise) {
        return false;
      }

      if (filters?.search) {
        const s = filters.search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(s);
        const matchesDesc = item.description.toLowerCase().includes(s);
        const matchesTag = item.tags.some(t => t.toLowerCase().includes(s));
        if (!matchesName && !matchesDesc && !matchesTag) return false;
      }

      return true;
    });
  }

  public async getMenuItemById(id: string): Promise<MenuItem | null> {
    if (this.isPostgresConnected && this.pool) {
      const res = await this.pool.query(
        'SELECT id, name, description, price_paise as "pricePaise", category, tags, is_available as "isAvailable", image_url as "imageUrl", roast_origin as "roastOrigin", cupping_score as "cuppingScore" FROM menu_items WHERE id = $1',
        [id]
      );
      return res.rows[0] || null;
    }

    return this.inMemoryMenuItems.find(i => i.id === id) || null;
  }

  public async createOrderPreview(
    itemsInput: Array<{ menuItemId: string; quantity: number; customizations?: string[] }>,
    handoffMethod: 'dine_in' | 'counter' | 'curbside' = 'counter',
    tableOrNotes?: string
  ): Promise<OrderPreview> {
    if (!itemsInput || itemsInput.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    const previewItems: OrderPreview['items'] = [];
    let subtotalPaise = 0;

    for (const itemInput of itemsInput) {
      const item = await this.getMenuItemById(itemInput.menuItemId);
      if (!item) {
        throw new Error(`Menu item not found: ${itemInput.menuItemId}`);
      }
      if (!item.isAvailable) {
        throw new Error(`Item currently unavailable: ${item.name}`);
      }
      const qty = Math.max(1, Math.min(20, Math.floor(itemInput.quantity)));
      const lineTotal = item.pricePaise * qty;
      subtotalPaise += lineTotal;

      previewItems.push({
        menuItemId: item.id,
        name: item.name,
        unitPricePaise: item.pricePaise,
        quantity: qty,
        lineTotalPaise: lineTotal,
        customizations: itemInput.customizations || [],
        isAvailable: item.isAvailable,
        imageUrl: item.imageUrl
      });
    }

    // Deterministic arithmetic calculations
    // Packaging deposit for takeaway / zero-waste bottle
    const packagingFeePaise = 0;
    // Fair Trade & Sustainability Surcharge: ₹20 (2000 paise)
    const fairTradeSurchargePaise = 2000;
    // GST 5% on subtotal (rounded to nearest integer paise)
    const gstPaise = Math.round(subtotalPaise * 0.05);
    const totalPaise = subtotalPaise + packagingFeePaise + fairTradeSurchargePaise + gstPaise;

    const previewId = `prev_${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const preview: OrderPreview = {
      previewId,
      items: previewItems,
      subtotalPaise,
      packagingFeePaise,
      fairTradeSurchargePaise,
      gstPaise,
      totalPaise,
      handoffMethod,
      tableOrNotes,
      estimatedMinutes: 8 + Math.min(12, previewItems.length * 2),
      expiresAt
    };

    this.inMemoryPreviews.set(previewId, preview);
    return preview;
  }

  public async createOrderFromPreview(
    previewId: string,
    confirmed: boolean,
    options?: { customerName?: string; notes?: string }
  ): Promise<Order> {
    if (!confirmed) {
      throw new Error('CONFIRMATION_REQUIRED: You must explicitly confirm the order before creation.');
    }

    const preview = this.inMemoryPreviews.get(previewId);
    if (!preview) {
      throw new Error('EXPIRED_PREVIEW: Order preview has expired or is invalid. Please review again.');
    }

    // Revalidate item availability and prices against database
    let validatedSubtotal = 0;
    for (const item of preview.items) {
      const dbItem = await this.getMenuItemById(item.menuItemId);
      if (!dbItem || !dbItem.isAvailable) {
        throw new Error(`Item is no longer available: ${item.name}`);
      }
      validatedSubtotal += dbItem.pricePaise * item.quantity;
    }

    const orderId = `ord_${crypto.randomUUID()}`;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `CC-${randomNum}`;
    const createdAt = new Date().toISOString();

    const order: Order = {
      id: orderId,
      orderNumber,
      status: 'brewing',
      stage: 2,
      stageDescription: 'Extraction & Grinding',
      subtotalPaise: preview.subtotalPaise,
      packagingFeePaise: preview.packagingFeePaise,
      fairTradeSurchargePaise: preview.fairTradeSurchargePaise,
      gstPaise: preview.gstPaise,
      totalPaise: preview.totalPaise,
      handoffMethod: preview.handoffMethod,
      notes: options?.notes || preview.tableOrNotes || 'Barista counter express',
      customerName: options?.customerName || 'Tasting Guest',
      estimatedMinutesLeft: preview.estimatedMinutes,
      targetReadyTime: new Date(Date.now() + preview.estimatedMinutes * 60000).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' IST',
      createdAt,
      items: preview.items.map(i => ({
        id: `oi_${crypto.randomUUID()}`,
        orderId,
        menuItemId: i.menuItemId,
        itemName: i.name,
        unitPricePaise: i.unitPricePaise,
        quantity: i.quantity,
        lineTotalPaise: i.lineTotalPaise,
        customizations: i.customizations
      }))
    };

    // If PostgreSQL connected, save transactionally with BEGIN / COMMIT
    if (this.isPostgresConnected && this.pool) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          `INSERT INTO orders (id, order_number, status, subtotal_paise, packaging_fee_paise, fair_trade_surcharge_paise, gst_paise, total_paise, handoff_method, notes, customer_name, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            order.id,
            order.orderNumber,
            order.status,
            order.subtotalPaise,
            order.packagingFeePaise,
            order.fairTradeSurchargePaise,
            order.gstPaise,
            order.totalPaise,
            order.handoffMethod,
            order.notes || null,
            order.customerName || null,
            order.createdAt
          ]
        );

        for (const it of order.items) {
          await client.query(
            `INSERT INTO order_items (id, order_id, menu_item_id, item_name, unit_price_paise, quantity, line_total_paise, customizations)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              it.id,
              it.orderId,
              it.menuItemId,
              it.itemName,
              it.unitPricePaise,
              it.quantity,
              it.lineTotalPaise,
              it.customizations || []
            ]
          );
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }

    // Save in in-memory map as well
    this.inMemoryOrders.set(order.id, order);
    this.inMemoryOrders.set(order.orderNumber, order);
    // Invalidate preview after successful order creation
    this.inMemoryPreviews.delete(previewId);

    return order;
  }

  public async getOrderById(orderIdOrNumber: string): Promise<Order | null> {
    if (this.isPostgresConnected && this.pool) {
      const orderRes = await this.pool.query(
        `SELECT id, order_number as "orderNumber", status, subtotal_paise as "subtotalPaise",
                packaging_fee_paise as "packagingFeePaise", fair_trade_surcharge_paise as "fairTradeSurchargePaise",
                gst_paise as "gstPaise", total_paise as "totalPaise", handoff_method as "handoffMethod",
                notes, customer_name as "customerName", created_at as "createdAt"
         FROM orders WHERE id = $1 OR order_number = $1`,
        [orderIdOrNumber]
      );
      if (orderRes.rows.length === 0) return null;
      const row = orderRes.rows[0];

      const itemsRes = await this.pool.query(
        `SELECT id, order_id as "orderId", menu_item_id as "menuItemId", item_name as "itemName",
                unit_price_paise as "unitPricePaise", quantity, line_total_paise as "lineTotalPaise",
                customizations
         FROM order_items WHERE order_id = $1`,
        [row.id]
      );

      return {
        ...row,
        stage: 2,
        stageDescription: 'Extraction & Grinding',
        estimatedMinutesLeft: 8,
        targetReadyTime: '08:51 AM IST',
        items: itemsRes.rows
      };
    }

    return this.inMemoryOrders.get(orderIdOrNumber) || null;
  }

  public async createMenuItem(data: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const newItem: MenuItem = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      pricePaise: data.pricePaise,
      category: data.category,
      tags: data.tags || [],
      isAvailable: data.isAvailable ?? true,
      imageUrl: data.imageUrl,
      roastOrigin: data.roastOrigin,
      cuppingScore: data.cuppingScore
    };

    if (this.isPostgresConnected && this.pool) {
      await this.pool.query(
        `INSERT INTO menu_items (id, name, description, price_paise, category, tags, is_available, image_url, roast_origin, cupping_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          newItem.id,
          newItem.name,
          newItem.description,
          newItem.pricePaise,
          newItem.category,
          newItem.tags,
          newItem.isAvailable,
          newItem.imageUrl || null,
          newItem.roastOrigin || null,
          newItem.cuppingScore || null
        ]
      );
    }

    this.inMemoryMenuItems.unshift(newItem);
    return newItem;
  }

  public async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    const existing = await this.getMenuItemById(id);
    if (!existing) return null;

    const updated: MenuItem = {
      ...existing,
      ...updates
    };

    if (this.isPostgresConnected && this.pool) {
      await this.pool.query(
        `UPDATE menu_items
         SET name = $1, description = $2, price_paise = $3, category = $4, tags = $5, is_available = $6, image_url = $7, roast_origin = $8, cupping_score = $9
         WHERE id = $10`,
        [
          updated.name,
          updated.description,
          updated.pricePaise,
          updated.category,
          updated.tags,
          updated.isAvailable,
          updated.imageUrl || null,
          updated.roastOrigin || null,
          updated.cuppingScore || null,
          id
        ]
      );
    }

    const idx = this.inMemoryMenuItems.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.inMemoryMenuItems[idx] = updated;
    }

    return updated;
  }

  public async updateOrderStatus(orderIdOrNumber: string, status: Order['status'], stage?: number, stageDescription?: string): Promise<Order | null> {
    const existing = await this.getOrderById(orderIdOrNumber);
    if (!existing) return null;

    const updated: Order = {
      ...existing,
      status,
      stage: stage ?? existing.stage,
      stageDescription: stageDescription ?? existing.stageDescription
    };

    if (this.isPostgresConnected && this.pool) {
      await this.pool.query(
        `UPDATE orders SET status = $1 WHERE id = $2 OR order_number = $2`,
        [status, orderIdOrNumber]
      );
    }

    this.inMemoryOrders.set(existing.id, updated);
    this.inMemoryOrders.set(existing.orderNumber, updated);
    return updated;
  }
}

export const db = new DatabaseRepository();
