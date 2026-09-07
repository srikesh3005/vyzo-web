/**
 * Vyzo — Category Classifier
 * Classifies a product into a Vyzo category based on its title, brand,
 * description, and category hints from the product provider.
 *
 * MVP: Rule-based keyword matching.
 * Future: Upgrade to AI-based classification or embedding similarity.
 */

import { db } from '@/lib/firebase/admin';

export interface ClassificationResult {
  category_id: string | null;
  subcategory_id: string | null;
  category_slug: string | null;
  category_name: string | null;
  confidence: 'high' | 'medium' | 'low';
  needs_review: boolean;
}

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
}

/**
 * Keyword → category slug mapping.
 * Each entry: [slug, keywords[]]
 * More specific subcategories are listed first (higher priority).
 */
const CLASSIFICATION_RULES: Array<[string, string[]]> = [
  // Electronics — specific first
  ['smartphones',         ['iphone', 'galaxy phone', 'oneplus', 'pixel phone', 'redmi', 'poco', 'realme', 'iqoo', 'vivo', 'oppo', 'nothing phone', 'mobile phone', 'smartphone']],
  ['laptops',             ['macbook', 'laptop', 'notebook', 'chromebook', 'ultrabook', 'gaming laptop', 'thinkpad', 'zenbook', 'spectre', 'inspiron', 'xps']],
  ['tablets',             ['ipad', 'tablet', 'fire hd', 'galaxy tab', 'lenovo tab']],
  ['headphones',          ['headphone', 'earphone', 'earbud', 'airpod', 'galaxy buds', 'wf-', 'wh-', 'qc45', 'neckband', 'in-ear', 'over-ear']],
  ['wearables',           ['smartwatch', 'fitness band', 'apple watch', 'galaxy watch', 'amazfit', 'fitbit', 'mi band', 'noise watch', 'fire-boltt']],
  ['tvs',                 ['television', 'smart tv', 'oled tv', 'qled', 'mi tv', 'vu tv', 'lg tv', 'samsung tv', 'sony bravia', 'fire tv', '55 inch', '65 inch']],
  ['cameras',             ['camera', 'dslr', 'mirrorless', 'gopro', 'action camera', 'webcam', 'security camera', 'canon', 'nikon', 'sony alpha', 'fujifilm']],
  ['gaming',              ['playstation', 'xbox', 'nintendo', 'gaming chair', 'gaming monitor', 'gaming keyboard', 'gaming mouse', 'controller', 'ps5', 'ps4']],
  ['audio',               ['speaker', 'soundbar', 'subwoofer', 'bluetooth speaker', 'jbl', 'bose soundbar', 'denon', 'yamaha receiver']],
  ['data-storage',        ['ssd', 'hard disk', 'hdd', 'nvme', 'pen drive', 'usb drive', 'memory card', 'sd card', 'flash drive', 'external drive']],
  ['mobile-accessories',  ['phone case', 'screen guard', 'tempered glass', 'charger', 'power bank', 'cable', 'usb-c', 'lightning cable', 'charging adapter', 'phone stand', 'phone holder']],
  ['networking',          ['router', 'wifi extender', 'mesh wifi', 'switch', 'ethernet', 'modem', 'tp-link', 'netgear', 'asus router']],
  ['echo-alexa',          ['echo dot', 'echo show', 'echo studio', 'echo flex', 'alexa']],
  ['fire-tv',             ['fire tv stick', 'fire tv cube', 'firestick']],
  ['personal-computers',  ['desktop', 'imac', 'mini pc', 'nuc', 'all-in-one pc', 'graphics card', 'gpu', 'processor', 'cpu', 'ram', 'motherboard']],
  // Fashion
  ['shoes',               ['shoe', 'sneaker', 'sandal', 'slipper', 'boot', 'heel', 'loafer', 'running shoe', 'sports shoe', 'adidas', 'nike', 'puma shoe', 'bata']],
  ['watches',             ['watch', 'chronograph', 'casio', 'titan watch', 'fossil watch', 'analog watch']],
  ['bags',                ['backpack', 'handbag', 'wallet', 'purse', 'messenger bag', 'shoulder bag', 'tote']],
  ['luggage',             ['trolley bag', 'suitcase', 'luggage', 'travel bag', 'cabin bag']],
  ['apparel',             ['t-shirt', 'shirt', 'dress', 'jeans', 'saree', 'kurta', 'jacket', 'sweater', 'hoodie', 'leggings', 'track pants', 'shorts', 'innerwear']],
  // Beauty
  ['skincare',            ['sunscreen', 'moisturiser', 'moisturizer', 'serum', 'face wash', 'toner', 'face cream', 'vitamin c', 'retinol', 'spf', 'sunblock']],
  ['haircare',            ['shampoo', 'conditioner', 'hair oil', 'hair mask', 'hair serum', 'hair care']],
  ['grooming',            ['shaving cream', 'razor', 'trimmer', 'beard oil', 'aftershave', 'grooming kit']],
  ['makeup',              ['lipstick', 'foundation', 'mascara', 'eyeshadow', 'concealer', 'blush', 'eyeliner', 'nail polish']],
  // Health & Fitness
  ['protein',             ['whey protein', 'whey', 'protein powder', 'mass gainer', 'isolate', 'muscleblaze', 'myprotein', 'optimum nutrition', 'dymatize']],
  ['supplements',         ['vitamin', 'omega-3', 'fish oil', 'multivitamin', 'probiotic', 'zinc', 'magnesium', 'biotin', 'collagen', 'supplement']],
  ['gym-equipment',       ['dumbbell', 'barbell', 'treadmill', 'elliptical', 'weight bench', 'gym equipment', 'plate', 'kettlebell', 'rowing machine']],
  ['yoga-fitness',        ['yoga mat', 'resistance band', 'foam roller', 'skipping rope', 'jump rope', 'exercise ball', 'pull-up bar']],
  // Home
  ['kitchen',             ['cookware', 'kadai', 'pressure cooker', 'air fryer', 'microwave', 'toaster', 'mixer grinder', 'juicer', 'induction cooktop', 'blender', 'kettle']],
  ['large-appliances',    ['refrigerator', 'washing machine', 'air conditioner', 'ac ', 'split ac', 'dishwasher', 'dryer', 'deep freezer']],
  ['personal-care-appliances', ['hair dryer', 'hair straightener', 'curling iron', 'electric shaver', 'epilator', 'electric toothbrush', 'water flosser']],
  ['furniture',           ['sofa', 'chair', 'desk', 'table', 'bed', 'wardrobe', 'bookshelf', 'cabinet', 'mattress', 'cushion', 'pillow']],
  ['lawn-garden',         ['fertilizer', 'plant pot', 'garden hose', 'pruning shears', 'seeds', 'gardening', 'compost']],
  // Books
  ['books',               ['book', 'novel', 'paperback', 'hardcover', 'textbook', 'storybook', 'autobiography', 'biography']],
  // Sports
  ['sports',              ['cricket bat', 'football', 'badminton', 'tennis', 'basketball', 'swimming', 'cycling', 'bicycle', 'sports equipment']],
  // Automotive
  ['automotive',          ['car', 'bike', 'motorcycle', 'car cover', 'seat cover', 'car charger', 'tyre', 'automotive', 'car care', 'helmet']],
  // Toys
  ['toys',                ['lego', 'toy', 'puzzle', 'board game', 'doll', 'action figure', 'remote control car', 'building blocks', 'baby toy', 'rattle']],
  // Pet
  ['pet-products',        ['dog food', 'cat food', 'pet food', 'dog collar', 'cat litter', 'pet toy', 'aquarium', 'bird cage', 'pet bed', 'dog leash']],
  // Grocery
  ['grocery',             ['rice', 'dal', 'oil', 'spice', 'ghee', 'sugar', 'flour', 'atta', 'biscuit', 'snack', 'coffee', 'tea', 'grocery', 'packaged food']],
  // Student
  ['hostel-essentials',   ['bedsheet', 'pillow cover', 'bucket', 'mug', 'tiffin', 'hostel', 'dormitory', 'student kit']],
  ['stationery',          ['pen', 'notebook', 'pencil', 'highlighter', 'stapler', 'file', 'binder', 'sticky notes']],
];

export class CategoryClassifier {
  private categories: CategoryRow[] = [];
  private categoriesLoaded = false;

  private async loadCategories(): Promise<void> {
    if (this.categoriesLoaded) return;
    try {
      const snapshot = await db.collection('categories').where('is_active', '==', true).get();
      this.categories = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          slug: data.slug,
          name: data.name,
          parent_id: data.parent_id ?? null,
        };
      });
      this.categoriesLoaded = true;
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  }

  private findBySlug(slug: string): CategoryRow | undefined {
    return this.categories.find((c) => c.slug === slug);
  }

  /**
   * Classify a product into a Vyzo category.
   */
  async classify(input: {
    title: string;
    brand?: string;
    description?: string;
    category_hint?: string; // e.g., Amazon's own category string
  }): Promise<ClassificationResult> {
    await this.loadCategories();

    const searchText = [
      input.title,
      input.brand ?? '',
      input.description ?? '',
      input.category_hint ?? '',
    ]
      .join(' ')
      .toLowerCase();

    let bestSlug: string | null = null;
    let matchCount = 0;

    for (const [slug, keywords] of CLASSIFICATION_RULES) {
      const matches = keywords.filter((kw) => searchText.includes(kw));
      if (matches.length > matchCount) {
        matchCount = matches.length;
        bestSlug = slug;
      }
    }

    if (!bestSlug) {
      return {
        category_id: null,
        subcategory_id: null,
        category_slug: null,
        category_name: null,
        confidence: 'low',
        needs_review: true,
      };
    }

    const found = this.findBySlug(bestSlug);
    if (!found) {
      return {
        category_id: null,
        subcategory_id: null,
        category_slug: bestSlug,
        category_name: null,
        confidence: 'low',
        needs_review: true,
      };
    }

    // Determine confidence based on match count
    const confidence: 'high' | 'medium' | 'low' =
      matchCount >= 3 ? 'high' : matchCount >= 1 ? 'medium' : 'low';

    if (found.parent_id) {
      // It's a subcategory — find parent
      const parent = this.categories.find((c) => c.id === found.parent_id);
      return {
        category_id: parent?.id ?? found.id,
        subcategory_id: found.id,
        category_slug: parent?.slug ?? found.slug,
        category_name: parent?.name ?? found.name,
        confidence,
        needs_review: confidence === 'low',
      };
    }

    return {
      category_id: found.id,
      subcategory_id: null,
      category_slug: found.slug,
      category_name: found.name,
      confidence,
      needs_review: confidence === 'low',
    };
  }
}
