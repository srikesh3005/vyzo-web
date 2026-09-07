-- ============================================================
-- Vyzo — Performance Indexes
-- Migration 004
-- ============================================================

-- ─── PRODUCTS ─────────────────────────────────────────────────────────────────

-- ASIN is the primary Amazon identity key — must be unique and fast
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_asin
  ON products (asin) WHERE asin IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug
  ON products (slug);

CREATE INDEX IF NOT EXISTS idx_products_category_id
  ON products (category_id);

CREATE INDEX IF NOT EXISTS idx_products_subcategory_id
  ON products (subcategory_id);

CREATE INDEX IF NOT EXISTS idx_products_brand_id
  ON products (brand_id);

CREATE INDEX IF NOT EXISTS idx_products_status
  ON products (status);

CREATE INDEX IF NOT EXISTS idx_products_is_trending
  ON products (is_trending) WHERE is_trending = TRUE;

CREATE INDEX IF NOT EXISTS idx_products_is_featured
  ON products (is_featured) WHERE is_featured = TRUE;

CREATE INDEX IF NOT EXISTS idx_products_merchant
  ON products (merchant);

CREATE INDEX IF NOT EXISTS idx_products_created_at
  ON products (created_at DESC);

-- Full-text search vector index (PostgreSQL native FTS)
CREATE INDEX IF NOT EXISTS idx_products_fts
  ON products USING GIN (
    to_tsvector('english',
      COALESCE(title, '') || ' ' ||
      COALESCE(brand_name, '') || ' ' ||
      COALESCE(description, '') || ' ' ||
      COALESCE(asin, '')
    )
  );

-- Trigram index for LIKE/ILIKE searches on title
CREATE INDEX IF NOT EXISTS idx_products_title_trgm
  ON products USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_brand_name_trgm
  ON products USING GIN (brand_name gin_trgm_ops);

-- ─── PRODUCT IMAGES ───────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_product_images_product_id
  ON product_images (product_id);

CREATE INDEX IF NOT EXISTS idx_product_images_is_primary
  ON product_images (product_id, is_primary);

-- ─── PRODUCT SPECIFICATIONS ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_product_specs_product_id
  ON product_specifications (product_id);

-- ─── PRODUCT SUBMISSIONS ──────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_product_submissions_asin
  ON product_submissions (asin) WHERE asin IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_product_submissions_user_id
  ON product_submissions (user_id);

CREATE INDEX IF NOT EXISTS idx_product_submissions_status
  ON product_submissions (status);

CREATE INDEX IF NOT EXISTS idx_product_submissions_created_at
  ON product_submissions (created_at DESC);

-- ─── AFFILIATE CLICKS ─────────────────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliate_clicks_click_id
  ON affiliate_clicks (click_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product_id
  ON affiliate_clicks (product_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user_id
  ON affiliate_clicks (user_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at
  ON affiliate_clicks (created_at DESC);

-- ─── WALLET TRANSACTIONS ──────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id
  ON wallet_transactions (wallet_id);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id
  ON wallet_transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type
  ON wallet_transactions (type);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at
  ON wallet_transactions (created_at DESC);

-- ─── REWARDS ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_rewards_user_id
  ON rewards (user_id);

CREATE INDEX IF NOT EXISTS idx_rewards_status
  ON rewards (status);

CREATE INDEX IF NOT EXISTS idx_rewards_affiliate_click_id
  ON rewards (affiliate_click_id);

-- ─── SEARCH HISTORY ───────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_search_history_user_id
  ON search_history (user_id);

CREATE INDEX IF NOT EXISTS idx_search_history_query_trgm
  ON search_history USING GIN (query gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_search_history_created_at
  ON search_history (created_at DESC);

-- ─── RECENTLY VIEWED ──────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_id
  ON recently_viewed (user_id, viewed_at DESC);

-- ─── WISHLIST ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id
  ON wishlist_items (wishlist_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id
  ON wishlist_items (product_id);

-- ─── USERS ────────────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
  ON users (email);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username
  ON users (username) WHERE username IS NOT NULL;

-- ─── AUDIT LOGS ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
  ON audit_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON audit_logs (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON audit_logs (created_at DESC);

-- ─── REFRESH TOKENS ───────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id
  ON refresh_tokens (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash
  ON refresh_tokens (token_hash);

-- ─── CATEGORIES ───────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug
  ON categories (slug);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id
  ON categories (parent_id);
