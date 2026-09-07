# SEO Configuration

This directory contains instructions and utilities for managing SEO metadata across the Vyzo project.

## Adding `generateMetadata` to Pages

To ensure every page has rich SEO data, you should add `generateMetadata` exports to your Next.js Server Components.

### Example for Product Pages (`/app/products/[slug]/page.tsx`)

```typescript
import { Metadata } from 'next';
import { productMetadata } from '@/lib/seo/metadata';
import { products } from '@/lib/data';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = products.find(p => p.slug === params.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found - Vyzo',
      description: 'The requested product could not be found.',
    };
  }

  return productMetadata(product);
}
```

### Example for Category Pages (`/app/categories/[slug]/page.tsx`)

```typescript
import { Metadata } from 'next';
import { categoryMetadata } from '@/lib/seo/metadata';
import { categories } from '@/lib/data';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = categories.find(c => c.slug === params.slug);
  if (!category) return {};
  return categoryMetadata(category);
}
```

### Schema.org Integration

For rich snippets in Google Search, include JSON-LD in your pages using the utilities in `@/lib/seo/schema.ts`.

```tsx
import { productSchema } from '@/lib/seo/schema';

// Inside your component render:
const schema = productSchema(product);

return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
    {/* Page Content */}
  </>
);
```
