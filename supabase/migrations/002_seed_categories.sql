-- ============================================================
-- Vyzo — Seed Categories
-- Migration 002
-- ============================================================

-- ─── TOP-LEVEL CATEGORIES ─────────────────────────────────────────────────────

INSERT INTO categories (slug, name, icon, description, sort_order) VALUES
  ('electronics',      'Electronics',        'Cpu',        'Gadgets, devices and tech accessories', 1),
  ('fashion',          'Fashion',            'Shirt',      'Clothing, footwear and accessories',    2),
  ('beauty',           'Beauty',             'Sparkles',   'Skincare, makeup and personal care',    3),
  ('health-fitness',   'Health & Fitness',   'Dumbbell',   'Supplements, equipment and wellness',   4),
  ('home',             'Home',               'Home',       'Kitchen, furniture and home decor',     5),
  ('books',            'Books',              'BookOpen',   'Books, stationery and learning',        6),
  ('sports',           'Sports & Outdoors',  'Trophy',     'Sports gear and outdoor equipment',     7),
  ('toys',             'Toys & Baby',        'Gamepad2',   'Toys, games and baby products',         8),
  ('automotive',       'Automotive',         'Car',        'Car accessories and tools',             9),
  ('grocery',          'Grocery',            'ShoppingBasket', 'Food and household essentials',    10),
  ('pet-products',     'Pet Products',       'PawPrint',   'Food and accessories for pets',        11),
  ('student-essentials', 'Student Essentials', 'GraduationCap', 'Everything a student needs',     12)
ON CONFLICT (slug) DO NOTHING;

-- ─── ELECTRONICS SUBCATEGORIES ────────────────────────────────────────────────

WITH parent AS (SELECT id FROM categories WHERE slug = 'electronics')
INSERT INTO categories (slug, name, icon, description, parent_id, sort_order)
SELECT slug, name, icon, description, parent.id, sort_order
FROM parent, (VALUES
  ('smartphones',        'Smartphones',        'Smartphone',  'Flagship and budget phones',                    1),
  ('laptops',            'Laptops',            'Laptop',      'Ultrabooks, gaming laptops and workstations',   2),
  ('tablets',            'Tablets',            'Tablet',      'iPads, Android tablets and more',               3),
  ('headphones',         'Headphones',         'Headphones',  'Earbuds, over-ear and noise-cancelling',        4),
  ('wearables',          'Wearables',          'Watch',       'Smartwatches and fitness trackers',             5),
  ('tvs',                'Televisions',        'Tv',          'OLED, QLED and smart TVs',                      6),
  ('cameras',            'Cameras',            'Camera',      'DSLR, mirrorless and action cameras',           7),
  ('gaming',             'Gaming',             'Gamepad2',    'Consoles, PCs and gaming accessories',          8),
  ('audio',              'Audio',              'Speaker',     'Speakers, soundbars and DACs',                  9),
  ('networking',         'Networking',         'Wifi',        'Routers, extenders and switches',              10),
  ('data-storage',       'Data Storage',       'HardDrive',   'SSDs, HDDs and memory cards',                  11),
  ('mobile-accessories', 'Mobile Accessories', 'Plug',        'Cases, chargers and cables',                   12),
  ('echo-alexa',         'Echo & Alexa',       'Mic',         'Amazon Echo and Alexa devices',                13),
  ('fire-tv',            'Fire TV',            'Tv2',         'Amazon Fire TV devices',                       14),
  ('personal-computers', 'Personal Computers', 'Monitor',     'Desktops and PC components',                   15)
) AS sub(slug, name, icon, description, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ─── FASHION SUBCATEGORIES ────────────────────────────────────────────────────

WITH parent AS (SELECT id FROM categories WHERE slug = 'fashion')
INSERT INTO categories (slug, name, icon, description, parent_id, sort_order)
SELECT slug, name, icon, description, parent.id, sort_order
FROM parent, (VALUES
  ('apparel',     'Apparel',     'Shirt',        'Clothing for men, women and kids',   1),
  ('shoes',       'Shoes',       'Footprints',   'Sneakers, heels and sandals',        2),
  ('watches',     'Watches',     'Clock',        'Luxury and casual watches',          3),
  ('bags',        'Bags',        'ShoppingBag',  'Backpacks, handbags and luggage',    4),
  ('accessories', 'Accessories', 'Gem',          'Jewellery, belts and more',          5),
  ('luggage',     'Luggage',     'Luggage',      'Suitcases and travel bags',          6)
) AS sub(slug, name, icon, description, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ─── BEAUTY SUBCATEGORIES ─────────────────────────────────────────────────────

WITH parent AS (SELECT id FROM categories WHERE slug = 'beauty')
INSERT INTO categories (slug, name, icon, description, parent_id, sort_order)
SELECT slug, name, icon, description, parent.id, sort_order
FROM parent, (VALUES
  ('skincare',    'Skincare',    'Droplet',  'Moisturisers, serums and sunscreen', 1),
  ('haircare',    'Haircare',    'Wind',     'Shampoos, conditioners and oils',    2),
  ('grooming',    'Grooming',    'Scissors', 'Shaving, trimming and beard care',   3),
  ('makeup',      'Makeup',      'Palette',  'Foundation, lipstick and more',      4),
  ('fragrances',  'Fragrances',  'Flower2',  'Perfumes and deodorants',            5)
) AS sub(slug, name, icon, description, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ─── HEALTH & FITNESS SUBCATEGORIES ──────────────────────────────────────────

WITH parent AS (SELECT id FROM categories WHERE slug = 'health-fitness')
INSERT INTO categories (slug, name, icon, description, parent_id, sort_order)
SELECT slug, name, icon, description, parent.id, sort_order
FROM parent, (VALUES
  ('protein',       'Protein',        'Zap',      'Whey, plant and mass gainers',       1),
  ('supplements',   'Supplements',    'Pill',     'Vitamins, minerals and health aids',  2),
  ('gym-equipment', 'Gym Equipment',  'Dumbbell', 'Heavy equipment and machines',        3),
  ('yoga-fitness',  'Yoga & Fitness', 'Activity', 'Mats, bands and light equipment',    4),
  ('nutrition',     'Nutrition',      'Apple',    'Diet foods and healthy snacks',       5)
) AS sub(slug, name, icon, description, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ─── HOME SUBCATEGORIES ───────────────────────────────────────────────────────

WITH parent AS (SELECT id FROM categories WHERE slug = 'home')
INSERT INTO categories (slug, name, icon, description, parent_id, sort_order)
SELECT slug, name, icon, description, parent.id, sort_order
FROM parent, (VALUES
  ('kitchen',       'Kitchen',             'UtensilsCrossed', 'Cookware and kitchen appliances', 1),
  ('furniture',     'Furniture',           'Sofa',            'Sofas, beds and tables',          2),
  ('home-decor',    'Home Decor',          'Palette',         'Art, lighting and decoration',    3),
  ('large-appliances', 'Large Appliances', 'WashingMachine',  'Refrigerators, ACs and washing machines', 4),
  ('personal-care-appliances', 'Personal Care Appliances', 'Zap', 'Hair dryers, trimmers', 5),
  ('lawn-garden',   'Lawn & Garden',       'Leaf',            'Plants, tools and outdoor',       6)
) AS sub(slug, name, icon, description, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ─── BOOKS SUBCATEGORIES ──────────────────────────────────────────────────────

WITH parent AS (SELECT id FROM categories WHERE slug = 'books')
INSERT INTO categories (slug, name, icon, description, parent_id, sort_order)
SELECT slug, name, icon, description, parent.id, sort_order
FROM parent, (VALUES
  ('fiction',       'Fiction',     'Book',      'Novels, thrillers and fantasy',     1),
  ('non-fiction',   'Non-Fiction', 'BookMarked','Self-help, biographies and history', 2),
  ('academic',      'Academic',    'GraduationCap', 'Textbooks and study material',  3),
  ('stationery',    'Stationery',  'Pen',       'Pens, notebooks and office supplies', 4)
) AS sub(slug, name, icon, description, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ─── HOSTEL ESSENTIALS (under Student Essentials) ─────────────────────────────

WITH parent AS (SELECT id FROM categories WHERE slug = 'student-essentials')
INSERT INTO categories (slug, name, icon, description, parent_id, sort_order)
SELECT slug, name, icon, description, parent.id, sort_order
FROM parent, (VALUES
  ('hostel-essentials', 'Hostel Essentials', 'BedDouble', 'Bedding, utensils and dorm room must-haves', 1),
  ('study-gadgets',     'Study Gadgets',     'Laptop',    'Earbuds, tablets and study tools',           2)
) AS sub(slug, name, icon, description, sort_order)
ON CONFLICT (slug) DO NOTHING;
