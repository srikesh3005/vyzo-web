export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  currency: string;
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  inStock: boolean;
  trending: boolean;
  featured: boolean;
  editorsPick: boolean;
  bestSeller: boolean;
  aiSummary: string;
  pros: string[];
  cons: string[];
  specs: Record<string, string>;
  description: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  count: number;
  image: string;
  description: string;
};

const img = (id: number, w = 800, h = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;

const g = (id: number, w = 800, h = 800) => img(id, w, h);

export const products: Product[] = [
  {
    id: '1',
    slug: 'macbook-air-m3',
    name: 'MacBook Air M3 13"',
    brand: 'Apple',
    category: 'laptops',
    price: 89990,
    mrp: 114900,
    currency: 'INR',
    rating: 4.8,
    reviewCount: 3421,
    image: img(18105),
    gallery: [img(18105), img(205426), img(1029757), img(777001)],
    inStock: true,
    trending: true,
    featured: true,
    editorsPick: true,
    bestSeller: true,
    aiSummary:
      'The MacBook Air M3 delivers exceptional performance for everyday tasks and light creative work. Its fanless design stays silent, battery life is class-leading at 18 hours, and the Liquid Retina display is stunning. Best for students, writers, and professionals who value portability.',
    pros: [
      'Class-leading 18-hour battery life',
      'Silent fanless design',
      'Stunning Liquid Retina display',
      'Excellent build quality',
      'MagSafe charging',
    ],
    cons: [
      'Limited to 2 external displays',
      'Base model has only 8GB RAM',
      'No SD card slot',
      'Expensive upgrades',
    ],
    specs: {
      Processor: 'Apple M3 8-core CPU',
      Graphics: '10-core GPU',
      RAM: '8GB Unified Memory',
      Storage: '256GB SSD',
      Display: '13.6" Liquid Retina (2560x1664)',
      Battery: 'Up to 18 hours',
      Weight: '1.24 kg',
      Ports: '2x Thunderbolt 4, MagSafe 3, 3.5mm jack',
      OS: 'macOS Sonoma',
    },
    description:
      'The MacBook Air M3 is the perfect blend of power and portability. With the M3 chip, it handles everything from everyday browsing to video editing with ease.',
  },
  {
    id: '2',
    slug: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    category: 'smartphones',
    price: 134900,
    mrp: 159900,
    currency: 'INR',
    rating: 4.7,
    reviewCount: 8932,
    image: img(699122),
    gallery: [img(699122), img(788946), img(513256), img(47261)],
    inStock: true,
    trending: true,
    featured: true,
    editorsPick: false,
    bestSeller: true,
    aiSummary:
      'The iPhone 15 Pro brings titanium build, the A17 Pro chip, and a customizable Action button. The camera system is excellent for photography and pro-level video. USB-C is a welcome change. Best for users who want a premium, future-proof smartphone.',
    pros: [
      'Premium titanium build',
      'Powerful A17 Pro chip',
      'Excellent camera system',
      'USB-C connectivity',
      'Action button customization',
    ],
    cons: [
      'Expensive',
      'Charging speed still slow',
      'No telephoto on base model',
      'iOS limitations remain',
    ],
    specs: {
      Display: '6.1" Super Retina XDR OLED',
      Processor: 'A17 Pro 6-core',
      RAM: '8GB',
      Storage: '128GB / 256GB / 512GB / 1TB',
      Camera: '48MP + 12MP + 12MP',
      Battery: 'Up to 23 hours video',
      Weight: '187 g',
      OS: 'iOS 17',
    },
    description:
      'The iPhone 15 Pro features a titanium design, the powerful A17 Pro chip, and an advanced camera system for pro-level photography and video.',
  },
  {
    id: '3',
    slug: 'samsung-galaxy-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'smartphones',
    price: 129999,
    mrp: 144999,
    currency: 'INR',
    rating: 4.6,
    reviewCount: 5210,
    image: img(1092644),
    gallery: [img(1092644), img(47261), img(699122), img(1841841)],
    inStock: true,
    trending: true,
    featured: false,
    editorsPick: true,
    bestSeller: false,
    aiSummary:
      'The Galaxy S24 Ultra is a powerhouse with its Snapdragon 8 Gen 3, 200MP camera, and integrated S Pen. Galaxy AI features like live translation and circle-to-search are genuinely useful. Best for power users who want the most feature-rich Android experience.',
    pros: [
      'Stunning 200MP camera',
      'Built-in S Pen',
      'Galaxy AI features',
      'Bright QHD+ display',
      'Titanium frame',
    ],
    cons: [
      'Heavy and bulky',
      'Expensive',
      'OneUI can be bloated',
      'Slow charging vs competitors',
    ],
    specs: {
      Display: '6.8" QHD+ Dynamic AMOLED 2X',
      Processor: 'Snapdragon 8 Gen 3',
      RAM: '12GB',
      Storage: '256GB / 512GB / 1TB',
      Camera: '200MP + 50MP + 12MP + 10MP',
      Battery: '5000 mAh',
      Weight: '232 g',
      OS: 'Android 14 (One UI 6.1)',
    },
    description:
      'The Galaxy S24 Ultra combines a 200MP camera, S Pen, and Galaxy AI in a premium titanium frame for the ultimate Android experience.',
  },
  {
    id: '4',
    slug: 'sony-wh-1000xm5',
    name: 'Sony WH-1000XM5',
    brand: 'Sony',
    category: 'headphones',
    price: 29990,
    mrp: 34990,
    currency: 'INR',
    rating: 4.7,
    reviewCount: 12450,
    image: img(3394650),
    gallery: [img(3394650), img(1649771), img(3784221), img(374071)],
    inStock: true,
    trending: true,
    featured: true,
    editorsPick: true,
    bestSeller: true,
    aiSummary:
      'The Sony WH-1000XM5 are the best noise-cancelling headphones you can buy. Industry-leading ANC, excellent sound quality, and a comfortable fit make them perfect for travel and office use. Battery life is outstanding at 30 hours.',
    pros: [
      'Best-in-class noise cancellation',
      'Excellent sound quality',
      'Comfortable for long sessions',
      '30-hour battery life',
      'Multipoint Bluetooth',
    ],
    cons: [
      'No folding design',
      'Case is larger than predecessor',
      'No 3.5mm cable included',
      'Pricey',
    ],
    specs: {
      Type: 'Over-ear wireless',
      'Noise Cancelling': 'Yes, industry-leading',
      Battery: '30 hours (ANC on)',
      Connectivity: 'Bluetooth 5.2, Multipoint',
      Weight: '250 g',
      Driver: '30mm',
      Charging: 'USB-C',
    },
    description:
      'The Sony WH-1000XM5 delivers industry-leading noise cancellation, exceptional sound quality, and 30 hours of battery life in a comfortable design.',
  },
  {
    id: '5',
    slug: 'dell-xps-15',
    name: 'Dell XPS 15 (2024)',
    brand: 'Dell',
    category: 'laptops',
    price: 189999,
    mrp: 219999,
    currency: 'INR',
    rating: 4.5,
    reviewCount: 2103,
    image: img(777001),
    gallery: [img(777001), img(18105), img(1029757), img(205426)],
    inStock: true,
    trending: false,
    featured: false,
    editorsPick: false,
    bestSeller: false,
    aiSummary:
      'The Dell XPS 15 is a premium Windows laptop with a stunning OLED display, strong Intel performance, and a sleek design. Great for creative professionals who need color-accurate screens and GPU power for editing.',
    pros: [
      'Gorgeous OLED display option',
      'Strong performance',
      'Premium aluminum build',
      'Good keyboard and trackpad',
    ],
    cons: [
      'Webcam placement at bottom',
      'Battery life average',
      'Expensive',
      'Limited ports',
    ],
    specs: {
      Processor: 'Intel Core i7-13700H',
      Graphics: 'NVIDIA RTX 4060',
      RAM: '16GB DDR5',
      Storage: '512GB SSD',
      Display: '15.6" OLED 3.5K',
      Battery: 'Up to 13 hours',
      Weight: '1.86 kg',
      OS: 'Windows 11',
    },
    description:
      'The Dell XPS 15 combines a stunning OLED display with powerful Intel and NVIDIA performance for creative professionals.',
  },
  {
    id: '6',
    slug: 'ipad-pro-m4',
    name: 'iPad Pro M4 11"',
    brand: 'Apple',
    category: 'tablets',
    price: 99900,
    mrp: 119900,
    currency: 'INR',
    rating: 4.6,
    reviewCount: 1876,
    image: img(1337580),
    gallery: [img(1337580), img(18105), img(777001), img(1029757)],
    inStock: true,
    trending: true,
    featured: true,
    editorsPick: false,
    bestSeller: false,
    aiSummary:
      'The iPad Pro M4 features the new Tandem OLED display and the powerful M4 chip. It is the fastest tablet available and the Ultra Retina XDR display is gorgeous. Best for creative pros and power users, though iPadOS still limits pro workflows.',
    pros: [
      'Stunning Tandem OLED display',
      'M4 chip is incredibly fast',
      'Thin and light design',
      'Apple Pencil Pro support',
    ],
    cons: [
      'Very expensive',
      'iPadOS still limits pro apps',
      'Accessories sold separately',
      'Base storage only 256GB',
    ],
    specs: {
      Display: '11" Ultra Retina XDR OLED',
      Processor: 'Apple M4',
      RAM: '8GB / 16GB',
      Storage: '256GB / 512GB / 1TB / 2TB',
      Camera: '12MP wide + LiDAR',
      Battery: 'Up to 10 hours',
      Weight: '444 g',
      OS: 'iPadOS 17',
    },
    description:
      'The iPad Pro M4 features a stunning Tandem OLED display and the powerful M4 chip for the ultimate tablet experience.',
  },
  {
    id: '7',
    slug: 'apple-watch-series-9',
    name: 'Apple Watch Series 9',
    brand: 'Apple',
    category: 'wearables',
    price: 41900,
    mrp: 49900,
    currency: 'INR',
    rating: 4.5,
    reviewCount: 6543,
    image: img(437037),
    gallery: [img(437037), img(3784221), img(1649771), img(374071)],
    inStock: true,
    trending: false,
    featured: false,
    editorsPick: false,
    bestSeller: true,
    aiSummary:
      'The Apple Watch Series 9 refines the best smartwatch formula. The double-tap gesture, brighter display, and S9 chip are welcome upgrades. Best for iPhone users who want the best health and fitness tracking.',
    pros: [
      'Brighter display',
      'Double-tap gesture',
      'Excellent health tracking',
      'Seamless iPhone integration',
    ],
    cons: [
      'iPhone only',
      'Battery still one day',
      'Minimal design change',
      'Expensive',
    ],
    specs: {
      Display: '45mm Always-On Retina',
      Processor: 'S9 SiP',
      Battery: 'Up to 18 hours',
      Water: '50m water resistant',
      Sensors: 'ECG, SpO2, Temperature',
      Connectivity: 'GPS, Bluetooth 5.3',
    },
    description:
      'The Apple Watch Series 9 features a brighter display, the S9 chip, and the innovative double-tap gesture.',
  },
  {
    id: '8',
    slug: 'bose-quietcomfort-ultra',
    name: 'Bose QuietComfort Ultra',
    brand: 'Bose',
    category: 'headphones',
    price: 37900,
    mrp: 44900,
    currency: 'INR',
    rating: 4.5,
    reviewCount: 3421,
    image: img(1649771),
    gallery: [img(1649771), img(3394650), img(3784221), img(374071)],
    inStock: true,
    trending: false,
    featured: false,
    editorsPick: false,
    bestSeller: false,
    aiSummary:
      'The Bose QuietComfort Ultra headphones offer the most comfortable fit and immersive audio with Bose Immersive Audio. ANC is excellent, though slightly behind Sony. Best for comfort-focused listeners.',
    pros: [
      'Most comfortable fit',
      'Immersive Audio feature',
      'Excellent ANC',
      'Premium build',
    ],
    cons: [
      'Battery life only 24 hours',
      'Expensive',
      'No 3.5mm cable',
      'Immersive Audio is gimmicky at times',
    ],
    specs: {
      Type: 'Over-ear wireless',
      'Noise Cancelling': 'Yes, with Immersive Audio',
      Battery: '24 hours (ANC on)',
      Connectivity: 'Bluetooth 5.3, Multipoint',
      Weight: '254 g',
      Charging: 'USB-C',
    },
    description:
      'The Bose QuietComfort Ultra headphones deliver immersive audio, excellent ANC, and the most comfortable fit in their class.',
  },
  {
    id: '9',
    slug: 'asus-rog-phone-8',
    name: 'ASUS ROG Phone 8 Pro',
    brand: 'ASUS',
    category: 'smartphones',
    price: 94999,
    mrp: 109999,
    currency: 'INR',
    rating: 4.4,
    reviewCount: 1234,
    image: img(788946),
    gallery: [img(788946), img(699122), img(47261), img(1841841)],
    inStock: true,
    trending: false,
    featured: false,
    editorsPick: false,
    bestSeller: false,
    aiSummary:
      'The ROG Phone 8 Pro is the ultimate gaming phone with a 165Hz display, Snapdragon 8 Gen 3, and advanced cooling. Best for serious mobile gamers who want peak performance.',
    pros: [
      '165Hz AMOLED display',
      'Powerful gaming performance',
      'Advanced cooling system',
      'Gaming-focused features',
    ],
    cons: [
      'Bulky design',
      'Average camera',
      'Expensive',
      'Heavy',
    ],
    specs: {
      Display: '6.78" AMOLED 165Hz',
      Processor: 'Snapdragon 8 Gen 3',
      RAM: '16GB / 24GB',
      Storage: '512GB / 1TB',
      Camera: '50MP + 13MP + 5MP',
      Battery: '5500 mAh',
      Weight: '225 g',
      OS: 'Android 14 (ROG UI)',
    },
    description:
      'The ASUS ROG Phone 8 Pro is the ultimate gaming smartphone with a 165Hz display and advanced cooling.',
  },
  {
    id: '10',
    slug: 'samsung-galaxy-tab-s9',
    name: 'Samsung Galaxy Tab S9',
    brand: 'Samsung',
    category: 'tablets',
    price: 72999,
    mrp: 84999,
    currency: 'INR',
    rating: 4.4,
    reviewCount: 987,
    image: img(1337580),
    gallery: [img(1337580), img(777001), img(18105), img(1029757)],
    inStock: true,
    trending: false,
    featured: false,
    editorsPick: false,
    bestSeller: false,
    aiSummary:
      'The Galaxy Tab S9 is the best Android tablet with a gorgeous AMOLED display, S Pen included, and DeX mode for productivity. Best for Android users who want a premium tablet experience.',
    pros: [
      'Stunning AMOLED display',
      'S Pen included',
      'Samsung DeX mode',
      'IP68 water resistance',
    ],
    cons: [
      'Android tablet app gap',
      'Expensive',
      'Keyboard sold separately',
      'Average battery life',
    ],
    specs: {
      Display: '11" Dynamic AMOLED 2X 120Hz',
      Processor: 'Snapdragon 8 Gen 2',
      RAM: '8GB / 12GB',
      Storage: '128GB / 256GB',
      Camera: '13MP + 8MP',
      Battery: '8400 mAh',
      Weight: '498 g',
      OS: 'Android 13 (One UI 5.1)',
    },
    description:
      'The Samsung Galaxy Tab S9 features a stunning AMOLED display, included S Pen, and DeX mode for productivity.',
  },
  {
    id: '11',
    slug: 'lg-c3-oled-tv',
    name: 'LG C3 65" OLED evo TV',
    brand: 'LG',
    category: 'tvs',
    price: 189990,
    mrp: 249990,
    currency: 'INR',
    rating: 4.7,
    reviewCount: 2341,
    image: img(333984),
    gallery: [img(333984), img(1649771), img(3784221), img(374071)],
    inStock: true,
    trending: false,
    featured: true,
    editorsPick: false,
    bestSeller: false,
    aiSummary:
      'The LG C3 OLED delivers perfect blacks, infinite contrast, and excellent gaming features with 120Hz, VRR, and 4x HDMI 2.1. Best for home theater enthusiasts and gamers.',
    pros: [
      'Perfect OLED blacks',
      'Excellent gaming features',
      'webOS is smooth',
      'Slim design',
    ],
    cons: [
      'Brightness lower than mini-LED',
      'Burn-in risk with static content',
      'Expensive',
      'Sound quality average',
    ],
    specs: {
      Display: '65" OLED evo 4K 120Hz',
      Resolution: '3840 x 2160',
      HDR: 'Dolby Vision IQ, HDR10, HLG',
      Gaming: '4x HDMI 2.1, VRR, ALLM',
      OS: 'webOS 23',
      Processor: 'α5 AI Processor Gen6',
    },
    description:
      'The LG C3 OLED TV delivers perfect blacks, infinite contrast, and premium gaming features for home theater enthusiasts.',
  },
  {
    id: '12',
    slug: 'kindle-paperwhite',
    name: 'Kindle Paperwhite (2024)',
    brand: 'Amazon',
    category: 'ereaders',
    price: 15999,
    mrp: 18999,
    currency: 'INR',
    rating: 4.6,
    reviewCount: 8765,
    image: img(3784221),
    gallery: [img(3784221), img(374071), img(1649771), img(3394650)],
    inStock: true,
    trending: false,
    featured: false,
    editorsPick: false,
    bestSeller: true,
    aiSummary:
      'The Kindle Paperwhite remains the best e-reader for most people. The 6.8" display is crisp, waterproof, and the adjustable warm light is perfect for night reading. Best for avid readers.',
    pros: [
      'Crisp 6.8" 300ppi display',
      'Waterproof (IPX8)',
      'Adjustable warm light',
      'Weeks of battery life',
    ],
    cons: [
      'No physical page-turn buttons',
      'Ads on lock screen (unless paid)',
      'USB-C charging only (no fast charge)',
      'Storage not expandable',
    ],
    specs: {
      Display: '6.8" E Ink 300ppi',
      Storage: '16GB',
      Battery: 'Up to 10 weeks',
      Water: 'IPX8 waterproof',
      Lighting: '17 LEDs with adjustable warm light',
      Connectivity: 'Wi-Fi, Bluetooth (Audible)',
    },
    description:
      'The Kindle Paperwhite features a crisp 6.8" display, waterproof design, and weeks of battery life for avid readers.',
  },
];

export const categories: Category[] = [
  {
    id: '1',
    slug: 'smartphones',
    name: 'Smartphones',
    icon: 'Smartphone',
    count: 248,
    image: img(699122, 600, 400),
    description: 'Flagship and budget phones with AI-powered reviews.',
  },
  {
    id: '2',
    slug: 'laptops',
    name: 'Laptops',
    icon: 'Laptop',
    count: 187,
    image: img(18105, 600, 400),
    description: 'Ultrabooks, gaming laptops, and workstations.',
  },
  {
    id: '3',
    slug: 'headphones',
    name: 'Headphones',
    icon: 'Headphones',
    count: 312,
    image: img(3394650, 600, 400),
    description: 'Noise-cancelling, wireless, and audiophile gear.',
  },
  {
    id: '4',
    slug: 'tablets',
    name: 'Tablets',
    icon: 'Tablet',
    count: 94,
    image: img(1337580, 600, 400),
    description: 'Premium tablets for work, creativity, and play.',
  },
  {
    id: '5',
    slug: 'wearables',
    name: 'Wearables',
    icon: 'Watch',
    count: 156,
    image: img(437037, 600, 400),
    description: 'Smartwatches and fitness trackers.',
  },
  {
    id: '6',
    slug: 'tvs',
    name: 'TVs',
    icon: 'Tv',
    count: 78,
    image: img(333984, 600, 400),
    description: 'OLED, QLED, and large-screen displays.',
  },
  {
    id: '7',
    slug: 'ereaders',
    name: 'E-Readers',
    icon: 'BookOpen',
    count: 23,
    image: img(3784221, 600, 400),
    description: 'E-ink readers for book lovers.',
  },
  {
    id: '8',
    slug: 'cameras',
    name: 'Cameras',
    icon: 'Camera',
    count: 112,
    image: img(513256, 600, 400),
    description: 'Mirrorless, DSLR, and compact cameras.',
  },
];

export const brands = [
  'Apple',
  'Samsung',
  'Sony',
  'Dell',
  'Bose',
  'ASUS',
  'LG',
  'Amazon',
  'Google',
  'OnePlus',
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export function formatPrice(price: number | null | undefined, currency = 'INR'): string {
  if (price === null || price === undefined) {
    return 'Check on Amazon';
  }
  if (currency === 'INR') {
    return '₹' + price.toLocaleString('en-IN');
  }
  return '$' + price.toLocaleString('en-US');
}

export function discount(price: number | null | undefined, mrp: number | null | undefined): number {
  if (!price || !mrp || mrp <= 0) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
