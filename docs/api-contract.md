# Café Companion — Minimal API Contract (v1)

Base URL: `/api/v1`  
All currency figures are represented in **integer paise** (₹1 = 100 paise).

---

## 1. Standard Error Schema

All failure responses use HTTP 4xx or 5xx with the structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "A concise, safe explanation"
  }
}
```

Standard Error Codes:
- `VALIDATION_ERROR`: Missing or malformed parameters.
- `NOT_FOUND`: Resource does not exist.
- `ITEM_UNAVAILABLE`: One or more items are out of stock.
- `EXPIRED_PREVIEW`: Preview ID has expired or is invalid.
- `CONFIRMATION_REQUIRED`: Order submission attempted without explicit confirmation flag.
- `INTERNAL_ERROR`: Unexpected server error.

---

## 2. Endpoints

### 2.1 Health Check
- **`GET /api/v1/health`**
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "database": "connected" | "in-memory-fallback",
  "gemini": "ready" | "fallback-only",
  "timestamp": "2026-10-10T22:20:00Z"
}
```

---

### 2.2 Menu Items

- **`GET /api/v1/menu`**
- **Query Params (Optional)**:
  - `category`: string (e.g. `specialty`, `chai`, `bakery`, `small-plates`, `vegan`)
  - `search`: string
  - `maxPricePaise`: integer
- **Response `200 OK`**:
```json
{
  "items": [
    {
      "id": "e4b10b0e-4361-460d-9a84-0a63e9f02241",
      "name": "Iced Americano",
      "description": "Toasted almond aroma, balanced orange zest finish, clean extraction.",
      "pricePaise": 17500,
      "category": "specialty",
      "tags": ["cold", "sugar-free", "84+ specialty", "medium roast"],
      "isAvailable": true,
      "imageUrl": "https://lh3.googleusercontent.com/...",
      "roastOrigin": "Chikmagalur Medium Roast"
    }
  ]
}
```

- **`GET /api/v1/menu/:id`**
- **Response `200 OK`**:
```json
{
  "item": {
    "id": "e4b10b0e-4361-460d-9a84-0a63e9f02241",
    "name": "Iced Americano",
    "description": "Toasted almond aroma, balanced orange zest finish, clean extraction.",
    "pricePaise": 17500,
    "category": "specialty",
    "tags": ["cold", "sugar-free"],
    "isAvailable": true,
    "imageUrl": "...",
    "roastOrigin": "Chikmagalur Medium Roast"
  }
}
```

---

### 2.3 AI Recommendations

- **`POST /api/v1/ai/recommendations`**
- **Request Body**:
```json
{
  "query": "something cold, not too sweet, and under ₹200",
  "dietary": "vegetarian",
  "maxPricePaise": 20000
}
```
- **Response `200 OK`**:
```json
{
  "recommendations": [
    {
      "menuItemId": "e4b10b0e-4361-460d-9a84-0a63e9f02241",
      "name": "Iced Americano",
      "pricePaise": 17500,
      "rationale": "Zero refined sugar with bright citrus clarity, well below ₹200.",
      "pairingSuggestion": "Roasted Almond Biscotti"
    }
  ],
  "sensorySummary": "Light body, crisp cold profile with subdued natural sweetness.",
  "fallbackUsed": false
}
```

---

### 2.4 Conversational Agent Chat

- **`POST /api/v1/agent/chat`**
- Uses Gemini with exactly two tools: `search_menu` and `preview_order`.
- **Request Body**:
```json
{
  "message": "I want something cold under ₹200",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "model", "content": "Namaste! How may I assist your coffee cravings today?" }
  ]
}
```
- **Response `200 OK`**:
```json
{
  "reply": "Splendid choice. I recommend our Iced Americano (₹175) or Light Palm Cold Coffee (₹195).",
  "toolsUsed": ["search_menu"],
  "recommendedItems": [
    {
      "id": "e4b10b0e-4361-460d-9a84-0a63e9f02241",
      "name": "Iced Americano",
      "pricePaise": 17500,
      "category": "specialty",
      "tags": ["cold", "sugar-free", "In Budget"],
      "isAvailable": true
    }
  ],
  "orderPreview": null,
  "fallbackUsed": false
}
```

---

### 2.5 Order Preview

- **`POST /api/v1/orders/preview`**
- Calculates arithmetic server-side; validates availability.
- **Request Body**:
```json
{
  "items": [
    { "menuItemId": "e4b10b0e-4361-460d-9a84-0a63e9f02241", "quantity": 1, "customizations": ["Whole Milk"] },
    { "menuItemId": "a1c20b0e-1111-460d-9a84-0a63e9f02242", "quantity": 1 }
  ],
  "handoffMethod": "counter",
  "tableOrNotes": "Table 04 Express"
}
```
- **Response `200 OK`**:
```json
{
  "previewId": "prev_928df73a-4421-4d1a",
  "items": [
    {
      "menuItemId": "e4b10b0e-4361-460d-9a84-0a63e9f02241",
      "name": "Iced Americano",
      "unitPricePaise": 17500,
      "quantity": 1,
      "lineTotalPaise": 17500,
      "customizations": ["Whole Milk"],
      "isAvailable": true
    }
  ],
  "subtotalPaise": 17500,
  "packagingFeePaise": 0,
  "fairTradeSurchargePaise": 2000,
  "gstPaise": 875,
  "totalPaise": 20375,
  "handoffMethod": "counter",
  "estimatedMinutes": 10,
  "expiresAt": "2026-10-10T22:35:00Z"
}
```

---

### 2.6 Order Creation (Requires Confirmation)

- **`POST /api/v1/orders`**
- **Request Body**:
```json
{
  "previewId": "prev_928df73a-4421-4d1a",
  "confirmed": true,
  "customerName": "Guest Table 04",
  "notes": "Almond allergy precautions"
}
```
- If `confirmed !== true`, returns HTTP 400 `CONFIRMATION_REQUIRED`.
- Revalidates items against database and persists transactionally.
- **Response `201 Created`**:
```json
{
  "order": {
    "id": "ord_9182304-4b82-4112",
    "orderNumber": "CC-8429",
    "status": "brewing",
    "subtotalPaise": 17500,
    "packagingFeePaise": 0,
    "fairTradeSurchargePaise": 2000,
    "gstPaise": 875,
    "totalPaise": 20375,
    "items": [
      {
        "id": "oi_11223344",
        "menuItemId": "e4b10b0e-4361-460d-9a84-0a63e9f02241",
        "itemName": "Iced Americano",
        "unitPricePaise": 17500,
        "quantity": 1,
        "lineTotalPaise": 17500
      }
    ],
    "handoffMethod": "counter",
    "estimatedMinutes": 8,
    "createdAt": "2026-10-10T22:20:00Z"
  }
}
```

---

### 2.7 Order Retrieval

- **`GET /api/v1/orders/:id`**
- **Response `200 OK`**:
```json
{
  "order": {
    "id": "ord_9182304-4b82-4112",
    "orderNumber": "CC-8429",
    "status": "brewing",
    "stage": 2,
    "stageDescription": "Extraction & Grinding",
    "totalPaise": 20375,
    "items": [...],
    "estimatedMinutesLeft": 8,
    "targetReadyTime": "08:51 AM IST",
    "createdAt": "2026-10-10T22:20:00Z"
  }
}
```
