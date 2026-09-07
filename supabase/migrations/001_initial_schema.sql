-- ============================================================
-- Vyzo — Initial Database Schema
-- Migration 001: Core tables
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- trigram for full-text search

-- ─── USERS ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT NOT NULL UNIQUE,
  username      TEXT UNIQUE,
  full_name     TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  location      TEXT,
  password_hash TEXT,                   -- NULL when using Supabase Auth
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  -- Preferences (stored as JSON for flexibility)
  preferences   JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── REFRESH TOKENS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CATEGORIES ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  icon        TEXT,                     -- lucide icon name
  description TEXT,
  image_url   TEXT,
  parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── BRANDS ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS brands (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  logo_url    TEXT,
  website     TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── COMMISSION RULES ─────────────────────────────────────────────────────────
-- Configurable by admin. NEVER hardcoded in application code.

CREATE TABLE IF NOT EXISTS commission_rules (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  -- category_id is nullable: NULL = "All Other Categories" catch-all
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  rate            NUMERIC(10,6) NOT NULL,    -- e.g., 0.05 = 5%
  maximum_reward  NUMERIC(12,2),             -- cap in INR (e.g., 3.00 for Bill Pay)
  description     TEXT,
  priority        INTEGER NOT NULL DEFAULT 0, -- higher = checked first
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRODUCTS ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Amazon identity
  asin                  TEXT UNIQUE,            -- PRIMARY identity key for Amazon products
  merchant              TEXT NOT NULL DEFAULT 'amazon',
  -- Core data
  slug                  TEXT NOT NULL UNIQUE,
  title                 TEXT NOT NULL,
  brand_id              UUID REFERENCES brands(id) ON DELETE SET NULL,
  brand_name            TEXT,                   -- denormalized for fast reads
  category_id           UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id        UUID REFERENCES categories(id) ON DELETE SET NULL,
  description           TEXT,
  model_number          TEXT,
  -- Pricing (stored as integer paise to avoid floating-point issues)
  -- price_paise = price * 100 (e.g. ₹99.99 → 9999)
  price_paise           BIGINT,                 -- current price in paise
  original_price_paise  BIGINT,                 -- MRP in paise
  currency              TEXT NOT NULL DEFAULT 'INR',
  -- Ratings
  rating                NUMERIC(3,2),
  review_count          INTEGER,
  -- Availability
  availability          TEXT NOT NULL DEFAULT 'IN_STOCK'
                        CHECK (availability IN ('IN_STOCK', 'OUT_OF_STOCK', 'LIMITED', 'UNKNOWN')),
  -- URLs
  amazon_url            TEXT,
  affiliate_url         TEXT,                   -- ONLY set by admin or provider
  -- Commission (set by commission engine, never by frontend)
  commission_rule_id    UUID REFERENCES commission_rules(id) ON DELETE SET NULL,
  commission_rate       NUMERIC(10,6),          -- snapshot of rate at time of import
  estimated_commission_paise BIGINT,            -- calculated, in paise
  estimated_reward_paise     BIGINT,            -- 50% of commission, in paise
  -- AI content
  ai_summary            TEXT,
  ai_pros               JSONB,                  -- string[]
  ai_cons               JSONB,                  -- string[]
  ai_best_for           JSONB,                  -- string[]
  ai_who_should_avoid   JSONB,                  -- string[]
  ai_buying_advice      TEXT,
  ai_faqs               JSONB,                  -- {question, answer}[]
  ai_recommendation_score NUMERIC(3,1),
  ai_generated_at       TIMESTAMPTZ,
  ai_model_version      TEXT,
  -- SEO
  seo_title             TEXT,
  seo_description       TEXT,
  search_keywords       JSONB,                  -- string[]
  tags                  JSONB,                  -- string[]
  -- Analytics
  view_count            INTEGER NOT NULL DEFAULT 0,
  search_count          INTEGER NOT NULL DEFAULT 0,
  submission_count      INTEGER NOT NULL DEFAULT 0,
  affiliate_click_count INTEGER NOT NULL DEFAULT 0,
  -- Status flags
  status                TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'processing', 'published', 'unpublished', 'archived')),
  is_trending           BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured           BOOLEAN NOT NULL DEFAULT FALSE,
  is_editors_pick       BOOLEAN NOT NULL DEFAULT FALSE,
  is_best_seller        BOOLEAN NOT NULL DEFAULT FALSE,
  -- Timestamps
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRODUCT IMAGES ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  thumbnail_url TEXT,
  alt_text      TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRODUCT SPECIFICATIONS ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_specifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  group_name  TEXT,                     -- e.g., "Display", "Camera", "Battery"
  name        TEXT NOT NULL,            -- e.g., "RAM"
  value       TEXT NOT NULL,            -- e.g., "16 GB"
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- ─── PRODUCT SUBMISSIONS ──────────────────────────────────────────────────────
-- Every user URL submission, for analytics + admin review.

CREATE TABLE IF NOT EXISTS product_submissions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  amazon_url  TEXT NOT NULL,
  asin        TEXT,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  ip_address  TEXT,
  status      TEXT NOT NULL DEFAULT 'PROCESSING'
              CHECK (status IN ('PROCESSING', 'COMPLETED', 'DUPLICATE', 'FAILED', 'REJECTED')),
  error_msg   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── AFFILIATE CLICKS ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  click_id    TEXT NOT NULL UNIQUE,     -- VYZO-CLICK-<uuid>
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  merchant_id TEXT NOT NULL DEFAULT 'amazon',
  referrer    TEXT,
  device      TEXT,
  campaign    TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SEARCH HISTORY ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS search_history (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id          TEXT,
  query               TEXT NOT NULL,
  result_count        INTEGER,
  clicked_product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── WISHLISTS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wishlists (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT 'My Wishlist',
  is_default  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(wishlist_id, product_id)
);

-- ─── RECENTLY VIEWED ──────────────────────────────────────────────────────────
-- Maximum 100 per user enforced by application logic.

CREATE TABLE IF NOT EXISTS recently_viewed (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)             -- upsert on re-view, update viewed_at
);

-- ─── WALLETS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wallets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  -- cached_balance is a performance cache; source of truth is wallet_transactions
  cached_balance_coins BIGINT NOT NULL DEFAULT 0,  -- 1 coin = ₹0.01
  currency        TEXT NOT NULL DEFAULT 'INR',
  is_frozen       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id         UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  type              TEXT NOT NULL
                    CHECK (type IN (
                      'REWARD_PENDING',
                      'REWARD_CONFIRMED',
                      'REWARD_REVERSED',
                      'REDEMPTION',
                      'ADJUSTMENT',
                      'REFUND'
                    )),
  coins             BIGINT NOT NULL,      -- positive = credit, negative = debit
  balance_after     BIGINT NOT NULL,      -- snapshot after this transaction
  description       TEXT,
  reference_id      TEXT,                 -- click_id, order_id, etc.
  reference_type    TEXT,                 -- 'affiliate_click', 'admin_adjustment', etc.
  metadata          JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── REWARDS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rewards (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id            UUID REFERENCES products(id) ON DELETE SET NULL,
  affiliate_click_id    UUID REFERENCES affiliate_clicks(id) ON DELETE SET NULL,
  wallet_transaction_id UUID REFERENCES wallet_transactions(id) ON DELETE SET NULL,
  status                TEXT NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'REVERSED')),
  estimated_coins       BIGINT,
  confirmed_coins       BIGINT,
  -- Affiliate commission data (filled when confirmed)
  affiliate_order_id    TEXT,
  affiliate_commission_paise BIGINT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── AUDIT LOGS ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,            -- e.g., 'admin.product.update'
  entity_type TEXT,                     -- e.g., 'product', 'commission_rule'
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── AUTO-UPDATE updated_at TRIGGER ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_commission_rules_updated_at
  BEFORE UPDATE ON commission_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_rewards_updated_at
  BEFORE UPDATE ON rewards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_product_submissions_updated_at
  BEFORE UPDATE ON product_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
