-- ============================================================
-- Vyzo — Seed Commission Rules
-- Migration 003
-- NOTE: These are configurable business data, NOT immutable Amazon policy.
--       Admins can update these at any time from the admin panel.
--       Rates are Amazon India affiliate rates as of the date of this seeding.
-- ============================================================

-- Helper function to look up category UUID by slug
-- We use LEFT JOINs so the catch-all rule works even with no category.

INSERT INTO commission_rules (name, category_id, rate, maximum_reward, description, priority, is_active)
SELECT
  r.name,
  c.id AS category_id,
  r.rate,
  r.maximum_reward,
  r.description,
  r.priority,
  TRUE
FROM (
  VALUES
    -- Name, category_slug, rate, maximum_reward, description, priority
    ('Apparel & Accessories',     'apparel',              0.10,    NULL,  'Clothing, accessories and related items', 100),
    ('Shoes',                     'shoes',                0.10,    NULL,  'All footwear categories', 100),
    ('Luggage & Bags',            'bags',                 0.10,    NULL,  'Bags, handbags and luggage', 100),
    ('Luggage Category',          'luggage',              0.10,    NULL,  'Suitcases and travel bags', 100),
    ('Watches',                   'watches',              0.10,    NULL,  'All watch categories', 100),
    ('Beauty & Personal Care',    'beauty',               0.10,    NULL,  'Beauty, skincare and personal care', 100),
    ('Skincare',                  'skincare',             0.10,    NULL,  'Skincare products', 100),
    ('Haircare',                  'haircare',             0.10,    NULL,  'Hair care products', 100),
    ('Grooming',                  'grooming',             0.10,    NULL,  'Grooming and shaving', 100),
    ('Kitchen',                   'kitchen',              0.05,    NULL,  'Kitchen appliances and cookware', 90),
    ('Furniture',                 'furniture',            0.05,    NULL,  'Home furniture', 90),
    ('Home Decor',                'home-decor',           0.05,    NULL,  'Home decoration', 90),
    ('Echo & Alexa Devices',      'echo-alexa',           0.05,    NULL,  'Amazon Echo and Alexa devices', 90),
    ('Fire TV Devices',           'fire-tv',              0.05,    NULL,  'Amazon Fire TV sticks and devices', 90),
    ('Grocery & Fresh',           'grocery',              0.047,   NULL,  'Grocery and Amazon Fresh', 90),
    ('Health & Personal Care',    'health-fitness',       0.047,   NULL,  'Health products and supplements', 90),
    ('Nutrition & Protein',       'protein',              0.047,   NULL,  'Protein supplements', 90),
    ('Supplements',               'supplements',          0.047,   NULL,  'Vitamins and supplements', 90),
    ('Pet Products',              'pet-products',         0.047,   NULL,  'Pet food and accessories', 90),
    ('Mobile Accessories',        'mobile-accessories',   0.04,    NULL,  'Phone cases, chargers and cables', 80),
    ('Books',                     'books',                0.059,   NULL,  'All book categories', 80),
    ('Fiction Books',             'fiction',              0.059,   NULL,  'Fiction and novels', 80),
    ('Non-Fiction Books',         'non-fiction',          0.059,   NULL,  'Non-fiction and self-help', 80),
    ('Toys & Baby',               'toys',                 0.059,   NULL,  'Toys, games and baby products', 80),
    ('Personal Care Appliances',  'personal-care-appliances', 0.059, NULL, 'Hair dryers, electric razors', 80),
    ('Sports & Outdoors',         'sports',               0.059,   NULL,  'Sports equipment and outdoor gear', 80),
    ('Automotive',                'automotive',           0.059,   NULL,  'Car accessories and automotive', 80),
    ('Lawn & Garden',             'lawn-garden',          0.035,   NULL,  'Garden tools and outdoor', 70),
    ('Gaming',                    'gaming',               0.035,   NULL,  'Video games and gaming accessories', 70),
    ('Large Appliances',          'large-appliances',     0.035,   NULL,  'Refrigerators, washing machines, ACs', 70),
    ('Televisions',               'tvs',                  0.035,   NULL,  'All TV categories', 70),
    ('Personal Computers',        'personal-computers',   0.035,   NULL,  'Desktop PCs and components', 70),
    ('Smart Watches',             'wearables',            0.035,   NULL,  'Smartwatches and fitness bands', 70),
    ('Electronics General',       'electronics',          0.035,   NULL,  'General electronics category', 60),
    ('Headphones & Audio',        'headphones',           0.035,   NULL,  'Headphones, earbuds and audio', 60),
    ('Audio Equipment',           'audio',                0.035,   NULL,  'Speakers and audio equipment', 60),
    ('Cameras',                   'cameras',              0.035,   NULL,  'Cameras and photography equipment', 60),
    ('Tablets',                   'tablets',              0.035,   NULL,  'Tablets and e-readers', 60),
    ('Networking',                'networking',           0.035,   NULL,  'Routers and networking equipment', 60),
    ('Gym Equipment (Heavy)',      'gym-equipment',        0.025,   NULL,  'Heavy gym equipment and bicycles', 50),
    ('Yoga & Light Fitness',      'yoga-fitness',         0.025,   NULL,  'Yoga mats and light fitness equipment', 50),
    ('Data Storage',              'data-storage',         0.02,    NULL,  'SSDs, HDDs, memory cards', 50),
    ('Smartphones',               'smartphones',          0.01,    NULL,  'Mobile phones — lowest commission tier', 50),
    ('Laptops',                   'laptops',              0.035,   NULL,  'Laptops and notebooks', 60)
) AS r(name, category_slug, rate, maximum_reward, description, priority)
LEFT JOIN categories c ON c.slug = r.category_slug
ON CONFLICT DO NOTHING;

-- ─── CATCH-ALL RULE ───────────────────────────────────────────────────────────
-- This rule applies to any product that doesn't match a more specific rule.
-- Priority 0 = lowest, checked last.

INSERT INTO commission_rules (name, category_id, rate, maximum_reward, description, priority, is_active)
VALUES (
  'All Other Categories',
  NULL,         -- NULL category_id = catch-all
  0.05,
  NULL,
  'Default 5% commission for all categories not explicitly listed above',
  0,
  TRUE
)
ON CONFLICT DO NOTHING;
