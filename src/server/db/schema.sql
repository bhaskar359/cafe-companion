-- Café Companion Database Schema (PostgreSQL)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items (category);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items (is_available);

-- 2. orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- 3. order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id),
    item_name VARCHAR(255) NOT NULL,
    unit_price_paise INTEGER NOT NULL CHECK (unit_price_paise >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    line_total_paise INTEGER NOT NULL CHECK (line_total_paise >= 0),
    customizations TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
