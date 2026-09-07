export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  content: string[];
};

export const articles: Article[] = [
  {
    slug: 'best-laptops-2024',
    title: 'Best Laptops Under ₹80,000 in 2024: A Complete Buying Guide',
    excerpt:
      'We tested and compared the top laptops in this budget range. Here\'s what we found.',
    category: 'Buying Guide',
    date: 'Jul 15, 2024',
    readTime: '8 min read',
    image:
      'https://images.pexels.com/photos/18105/pexels-photo-18105.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
    content: [
      'Finding the right laptop under ₹80,000 can be tricky. You want performance, build quality, and battery life — all within budget. In this guide, we break down the best options available in 2024.',
      'The MacBook Air M3 leads the pack with its class-leading 18-hour battery life and silent fanless design. At ₹89,990, it\'s slightly above our budget, but deals often bring it under ₹80,000. The M3 chip handles everyday tasks and light creative work effortlessly.',
      'For Windows users, the Dell XPS 15 offers a stunning OLED display and strong Intel performance. While the base model starts higher, refurbished and sale prices can bring it into range. The build quality is exceptional.',
      'When choosing a laptop in this range, prioritize: processor performance (look for M-series or Intel 12th gen+), at least 16GB RAM for longevity, a good display (IPS or OLED), and build quality. Avoid laptops with soldered RAM if you plan to upgrade later.',
      'Our top pick remains the MacBook Air M3 for most users, thanks to its unmatched battery life and performance. For Windows-specific workflows, the Dell XPS 15 is an excellent alternative.',
    ],
  },
  {
    slug: 'iphone-vs-android',
    title: 'iPhone vs Android in 2024: Which Is Right For You?',
    excerpt:
      'The eternal debate, settled with data. We compare performance, cameras, and value.',
    category: 'Review',
    date: 'Jul 10, 2024',
    readTime: '6 min read',
    image:
      'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
    content: [
      'The iPhone vs Android debate has raged for over a decade. In 2024, both platforms are better than ever, but they serve different needs.',
      'The iPhone 15 Pro brings titanium build, the A17 Pro chip, and USB-C. iOS remains the most polished mobile experience with the best app ecosystem and long-term software support.',
      'On the Android side, the Samsung Galaxy S24 Ultra offers a 200MP camera, built-in S Pen, and Galaxy AI features like live translation and circle-to-search. Android gives you more freedom and customization.',
      'Choose iPhone if you value: simplicity, long-term software support, the Apple ecosystem, and the best video recording. Choose Android if you want: hardware variety, customization, the S Pen, and AI features.',
      'Both platforms are excellent in 2024. The right choice depends on your priorities, not on which is objectively better.',
    ],
  },
  {
    slug: 'ai-shopping-tips',
    title: '5 Ways AI Can Help You Shop Smarter',
    excerpt:
      'AI isn\'t just for chatbots. Here\'s how it can transform your shopping experience.',
    category: 'AI Tips',
    date: 'Jul 5, 2024',
    readTime: '5 min read',
    image:
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
    content: [
      'AI is transforming how we shop. Here are five practical ways AI can help you make better buying decisions.',
      '1. AI Summaries: Instead of reading hundreds of reviews, AI can analyze them all and give you the key takeaways in seconds. This is what Vyzo does for every product.',
      '2. Smart Comparisons: AI can compare products across dozens of specifications and highlight the differences that actually matter for your use case.',
      '3. Personalized Recommendations: By understanding your preferences and past purchases, AI can suggest products you\'ll actually love.',
      '4. Price Prediction: AI models can predict whether a price is likely to drop soon, helping you time your purchase.',
      '5. Natural Language Search: Instead of filtering by specs, you can simply ask "best laptop for video editing under ₹1 lakh" and get relevant results.',
    ],
  },
  {
    slug: 'headphones-buying-guide',
    title: 'Noise-Cancelling Headphones: Everything You Need to Know',
    excerpt:
      'From ANC technology to battery life, here\'s what matters when choosing headphones.',
    category: 'Buying Guide',
    date: 'Jun 28, 2024',
    readTime: '7 min read',
    image:
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
    content: [
      'Noise-cancelling headphones have become essential for travel, office work, and focused study. Here\'s what you need to know before buying.',
      'Active Noise Cancellation (ANC) uses microphones to detect ambient sound and creates an opposite sound wave to cancel it. The quality of ANC varies significantly between brands.',
      'The Sony WH-1000XM5 offers the best ANC in the market, with 30 hours of battery life and excellent sound quality. The Bose QuietComfort Ultra is the most comfortable option with immersive audio.',
      'When choosing, consider: ANC quality, battery life (look for 25+ hours), comfort for long sessions, sound quality, and multipoint Bluetooth for connecting to multiple devices.',
      'Our top pick is the Sony WH-1000XM5 for most users. If comfort is your priority, the Bose QuietComfort Ultra is worth the premium.',
    ],
  },
  {
    slug: 'macbook-vs-windows',
    title: 'MacBook vs Windows: The 2024 Showdown',
    excerpt:
      'Both platforms are great, but which one fits your needs? We break it down.',
    category: 'Review',
    date: 'Jun 20, 2024',
    readTime: '10 min read',
    image:
      'https://images.pexels.com/photos/205426/pexels-photo-205426.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
    content: [
      'The MacBook vs Windows debate is more nuanced than ever in 2024. Both platforms offer excellent hardware and software experiences.',
      'MacBooks, powered by Apple silicon (M3, M3 Pro, M3 Max), offer class-leading performance per watt, exceptional battery life, and a premium build. macOS is stable, beautiful, and integrates seamlessly with the Apple ecosystem.',
      'Windows laptops offer unmatched variety. From budget options to premium ultrabooks and gaming powerhouses, there\'s a Windows laptop for every need and budget. Windows 11 is a capable OS with better gaming support and software compatibility.',
      'Choose MacBook if you value: battery life, build quality, ecosystem integration, creative workflows (Final Cut, Logic), and a Unix-based terminal. Choose Windows if you need: gaming, specific Windows-only software, more hardware options, and upgradeability.',
      'There\'s no wrong choice — only the right choice for your needs. Both platforms are excellent in 2024.',
    ],
  },
  {
    slug: 'best-monitors-2024',
    title: 'Best Monitors for Productivity in 2024',
    excerpt:
      'From ultrawide to 4K, here are the monitors that will boost your workflow.',
    category: 'Buying Guide',
    date: 'Jun 15, 2024',
    readTime: '6 min read',
    image:
      'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
    content: [
      'A good monitor can transform your productivity. Here\'s our guide to the best monitors for work in 2024.',
      'For most users, a 27-inch 4K monitor is the sweet spot. It offers enough screen real estate for multitasking and sharp text for reading. Look for IPS panels for color accuracy.',
      'Ultrawide monitors (34-inch, 21:9 aspect ratio) are excellent for productivity, replacing a dual-monitor setup with a single seamless display. They\'re particularly great for video editing and coding.',
      'When choosing, consider: resolution (4K for 27"+, 1440p for 24-27"), panel type (IPS for color, VA for contrast), refresh rate (60Hz is fine for work, 120Hz+ for gaming), and ergonomics (height-adjustable stand).',
      'Don\'t forget about color accuracy if you do creative work. Look for monitors covering 100% sRGB and ideally 90%+ DCI-P3.',
    ],
  },
];
