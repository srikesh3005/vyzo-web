import { Metadata } from 'next';

// We use 'any' for types to avoid strict dependency on the data files which might have varied type definitions
type Product = any;
type Category = any;
type Article = any;

const BASE_URL = 'https://vyzo.in';

export function productMetadata(product: Product): Metadata {
  return {
    title: `${product.name} - Buy Online | Vyzo`,
    description: product.aiSummary || product.description?.substring(0, 160) || `Buy ${product.name} from ${product.brand} on Vyzo.`,
    openGraph: {
      title: product.name,
      description: product.aiSummary || product.description?.substring(0, 160),
      url: `${BASE_URL}/products/${product.slug}`,
      siteName: 'Vyzo',
      images: [
        {
          url: `${BASE_URL}${product.image}`,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.aiSummary || product.description?.substring(0, 160),
      images: [`${BASE_URL}${product.image}`],
    },
    alternates: {
      canonical: `${BASE_URL}/products/${product.slug}`,
    },
  };
}

export function categoryMetadata(category: Category): Metadata {
  return {
    title: `${category.name} - Shop Categories | Vyzo`,
    description: category.description || `Browse our collection of ${category.name} on Vyzo.`,
    openGraph: {
      title: category.name,
      description: category.description || `Browse our collection of ${category.name} on Vyzo.`,
      url: `${BASE_URL}/categories/${category.slug}`,
      siteName: 'Vyzo',
      images: [
        {
          url: `${BASE_URL}${category.image}`,
          width: 800,
          height: 600,
          alt: category.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: category.name,
      description: category.description || `Browse our collection of ${category.name} on Vyzo.`,
      images: [`${BASE_URL}${category.image}`],
    },
    alternates: {
      canonical: `${BASE_URL}/categories/${category.slug}`,
    },
  };
}

export function articleMetadata(article: Article): Metadata {
  return {
    title: `${article.title} | Vyzo Blog`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `${BASE_URL}/blog/${article.slug}`,
      siteName: 'Vyzo',
      images: [
        {
          url: `${BASE_URL}${article.image}`,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: 'article',
      publishedTime: new Date(article.date).toISOString(),
      authors: ['Vyzo Editorial Team'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [`${BASE_URL}${article.image}`],
    },
    alternates: {
      canonical: `${BASE_URL}/blog/${article.slug}`,
    },
  };
}
