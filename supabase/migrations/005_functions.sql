-- ============================================================
-- Vyzo — Database Stored Procedures
-- Migration 005: Helper functions used by the application layer
-- ============================================================

-- ─── increment_product_counter ───────────────────────────────────────────────
-- Safely increments a counter column on the products table.
-- Called fire-and-forget for view_count, affiliate_click_count, submission_count.

CREATE OR REPLACE FUNCTION increment_product_counter(
  p_product_id UUID,
  p_column TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow safe column names to prevent SQL injection
  IF p_column NOT IN ('view_count', 'affiliate_click_count', 'submission_count', 'search_count') THEN
    RAISE EXCEPTION 'Invalid column name: %', p_column;
  END IF;

  EXECUTE format(
    'UPDATE products SET %I = COALESCE(%I, 0) + 1 WHERE id = $1',
    p_column, p_column
  ) USING p_product_id;
END;
$$;

-- ─── create_wallet_transaction ────────────────────────────────────────────────
-- Atomically inserts a wallet transaction AND updates the cached balance.
-- Using a function ensures these two operations are always atomic.

CREATE OR REPLACE FUNCTION create_wallet_transaction(
  p_wallet_id UUID,
  p_user_id UUID,
  p_type TEXT,
  p_coins BIGINT,
  p_balance_after BIGINT,
  p_description TEXT,
  p_reference_id TEXT,
  p_reference_type TEXT,
  p_metadata JSONB
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  coins BIGINT,
  balance_after BIGINT,
  description TEXT,
  reference_id TEXT,
  reference_type TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tx_id UUID;
  v_created_at TIMESTAMPTZ;
BEGIN
  -- Insert transaction
  INSERT INTO wallet_transactions (
    wallet_id, user_id, type, coins, balance_after,
    description, reference_id, reference_type, metadata
  )
  VALUES (
    p_wallet_id, p_user_id, p_type, p_coins, p_balance_after,
    p_description, p_reference_id, p_reference_type, p_metadata
  )
  RETURNING wallet_transactions.id, wallet_transactions.created_at
  INTO v_tx_id, v_created_at;

  -- Update cached balance (only for non-pending transactions)
  IF p_type != 'REWARD_PENDING' THEN
    UPDATE wallets
    SET cached_balance_coins = p_balance_after,
        updated_at = NOW()
    WHERE wallets.id = p_wallet_id;
  END IF;

  -- Return the created transaction
  RETURN QUERY
  SELECT
    v_tx_id,
    p_type,
    p_coins,
    p_balance_after,
    p_description,
    p_reference_id,
    p_reference_type,
    v_created_at;
END;
$$;

-- ─── trim_recently_viewed ─────────────────────────────────────────────────────
-- Keeps only the N most recent items per user. Prevents unbounded growth.

CREATE OR REPLACE FUNCTION trim_recently_viewed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 100
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM recently_viewed
  WHERE id IN (
    SELECT id FROM recently_viewed
    WHERE user_id = p_user_id
    ORDER BY viewed_at DESC
    OFFSET p_limit
  );
END;
$$;

-- ─── search_products ─────────────────────────────────────────────────────────
-- Full-text search function (used as a fallback for complex queries)

CREATE OR REPLACE FUNCTION search_products(
  p_query TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  asin TEXT,
  title TEXT,
  brand_name TEXT,
  price_paise BIGINT,
  rating NUMERIC,
  availability TEXT,
  estimated_reward_paise BIGINT,
  rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.slug,
    p.asin,
    p.title,
    p.brand_name,
    p.price_paise,
    p.rating,
    p.availability,
    p.estimated_reward_paise,
    ts_rank(
      to_tsvector('english',
        COALESCE(p.title, '') || ' ' ||
        COALESCE(p.brand_name, '') || ' ' ||
        COALESCE(p.description, '')
      ),
      plainto_tsquery('english', p_query)
    ) AS rank
  FROM products p
  WHERE
    p.status = 'published'
    AND to_tsvector('english',
      COALESCE(p.title, '') || ' ' ||
      COALESCE(p.brand_name, '') || ' ' ||
      COALESCE(p.description, '')
    ) @@ plainto_tsquery('english', p_query)
  ORDER BY rank DESC, p.rating DESC NULLS LAST
  LIMIT p_limit OFFSET p_offset;
END;
$$;
