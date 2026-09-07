// Assuming the types are defined in lib/data and lib/blog-data, we will use any here or redefine minimally for the schema if we can't import them directly.
// In a real project, we'd import { Product, Category } from '../data' and { Article } from '../blog-data'

type Product = any;
type Category = any;
type Article = any;

const BASE_URL = 'https://vyzo.in';

export function productSchema(product: Product): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [
      `${BASE_URL}${product.image}`,
      ...(product.gallery ? product.gallery.map((img: string) => `${BASE_URL}${img}`) : [])
    ],
    description: product.description || product.aiSummary,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/products/${product.slug}`,
      priceCurrency: product.currency || 'INR',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: product.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    } : undefined,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}

export function articleSchema(article: Article): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    image: [
      `${BASE_URL}${article.image}`
    ],
    datePublished: new Date(article.date).toISOString(),
    dateModified: new Date(article.date).toISOString(),
    author: [{
      '@type': 'Organization',
      name: 'Vyzo Editorial Team',
      url: BASE_URL
    }],
    publisher: {
      '@type': 'Organization',
      name: 'Vyzo',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`
      }
    },
    description: article.excerpt,
  };
}

export function organizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Vyzo',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: [
      'https://twitter.com/vyzo',
      'https://instagram.com/vyzo',
      'https://linkedin.com/company/vyzo'
    ]
  };
}
