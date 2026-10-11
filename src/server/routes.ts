import { Router, type Request, type Response } from 'express';
import { db } from './db/index.ts';
import { generateRecommendations, chatWithAgent } from './gemini.ts';

export const apiRouter = Router();

// GET /api/v1/health
apiRouter.get('/health', async (_req: Request, res: Response) => {
  try {
    const status = await db.getStatus();
    res.json({
      status: 'healthy',
      database: status.type === 'postgres' ? 'connected' : 'in-memory-fallback',
      gemini: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' ? 'ready' : 'fallback-only',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: (error as Error).message
      }
    });
  }
});

// GET /api/v1/menu
apiRouter.get('/menu', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const maxPricePaise = req.query.maxPricePaise ? parseInt(req.query.maxPricePaise as string, 10) : undefined;

    const items = await db.getMenuItems({ category, search, maxPricePaise });
    res.json({ items });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'FETCH_MENU_FAILED',
        message: (error as Error).message
      }
    });
  }
});

// GET /api/v1/menu/:id
apiRouter.get('/menu/:id', async (req: Request, res: Response) => {
  try {
    const item = await db.getMenuItemById(req.params.id);
    if (!item) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Menu item '${req.params.id}' was not found.`
        }
      });
      return;
    }
    res.json({ item });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'FETCH_MENU_ITEM_FAILED',
        message: (error as Error).message
      }
    });
  }
});

// POST /api/v1/menu (Add new menu item to Cloud SQL / database)
apiRouter.post('/menu', async (req: Request, res: Response) => {
  try {
    const { name, description, pricePaise, category, tags, imageUrl, roastOrigin, cuppingScore, isAvailable } = req.body;
    if (!name || !description || typeof pricePaise !== 'number' || !category) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'name, description, pricePaise, and category are required.'
        }
      });
      return;
    }

    const created = await db.createMenuItem({
      name,
      description,
      pricePaise,
      category,
      tags: tags || [],
      isAvailable: isAvailable ?? true,
      imageUrl,
      roastOrigin,
      cuppingScore
    });

    res.status(201).json({ item: created });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'CREATE_MENU_ITEM_FAILED',
        message: (error as Error).message
      }
    });
  }
});

// PATCH /api/v1/menu/:id (Update existing item in Cloud SQL / database)
apiRouter.patch('/menu/:id', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateMenuItem(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Menu item '${req.params.id}' was not found.`
        }
      });
      return;
    }
    res.json({ item: updated });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'UPDATE_MENU_ITEM_FAILED',
        message: (error as Error).message
      }
    });
  }
});

// POST /api/v1/ai/recommendations
apiRouter.post('/ai/recommendations', async (req: Request, res: Response) => {
  try {
    const { query, dietary, maxPricePaise } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query text is required for AI recommendations.'
        }
      });
      return;
    }

    const result = await generateRecommendations(query, dietary, maxPricePaise);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'RECOMMENDATION_FAILED',
        message: (error as Error).message
      }
    });
  }
});

// POST /api/v1/agent/chat
apiRouter.post('/agent/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Chat message text is required.'
        }
      });
      return;
    }

    const response = await chatWithAgent(message, history || []);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'CHAT_FAILED',
        message: (error as Error).message
      }
    });
  }
});

// POST /api/v1/orders/preview
apiRouter.post('/orders/preview', async (req: Request, res: Response) => {
  try {
    const { items, handoffMethod, tableOrNotes } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Order preview requires an array of items with menuItemId and quantity.'
        }
      });
      return;
    }

    const preview = await db.createOrderPreview(items, handoffMethod, tableOrNotes);
    res.json(preview);
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'PREVIEW_CALCULATION_FAILED',
        message: (error as Error).message
      }
    });
  }
});

// POST /api/v1/orders (Requires explicit confirmation)
apiRouter.post('/orders', async (req: Request, res: Response) => {
  try {
    const { previewId, confirmed, customerName, notes } = req.body;

    if (!previewId) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'previewId is required to finalize an order.'
        }
      });
      return;
    }

    if (confirmed !== true) {
      res.status(400).json({
        error: {
          code: 'CONFIRMATION_REQUIRED',
          message: 'Customer must explicitly confirm the order review before creation.'
        }
      });
      return;
    }

    const order = await db.createOrderFromPreview(previewId, confirmed, { customerName, notes });
    res.status(201).json({ order });
  } catch (error) {
    const msg = (error as Error).message;
    const code = msg.startsWith('CONFIRMATION_REQUIRED')
      ? 'CONFIRMATION_REQUIRED'
      : msg.startsWith('EXPIRED_PREVIEW')
      ? 'EXPIRED_PREVIEW'
      : 'ORDER_CREATION_FAILED';

    res.status(400).json({
      error: {
        code,
        message: msg
      }
    });
  }
});

// GET /api/v1/orders/:id
apiRouter.get('/orders/:id', async (req: Request, res: Response) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Order '${req.params.id}' was not found.`
        }
      });
      return;
    }
    res.json({ order });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'ORDER_FETCH_FAILED',
        message: (error as Error).message
      }
    });
  }
});
