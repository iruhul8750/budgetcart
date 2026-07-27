import { defineCollection, z } from 'astro:content';

// Product collection schema - Ecommerce with affiliate links
const productsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // ===== BASIC INFO =====
    title: z.string().min(1, 'Title is required'),
    description: z.string().default(''),
    category: z.string().default('Uncategorized'),
    
    // ===== PRICING (Indian Rupee) =====
    price: z.string().min(1, 'Price is required'),
    originalPrice: z.string().optional(), // Original price with line-through
    
    // ===== AFFILIATE (Hidden from homepage) =====
    affiliateLink: z.string().url().optional(),
    affiliateNetwork: z.string().optional(),
    commission: z.string().optional(),
    showAffiliate: z.boolean().default(false), // Control visibility
    
    // ===== INVENTORY =====
    inStock: z.boolean().default(true),
    quantity: z.number().min(0).default(0),
    sku: z.string().optional(),
    
    // ===== RATINGS =====
    rating: z.number().min(0).max(5).default(0),
    reviewCount: z.number().min(0).default(0),
    
    // ===== IMAGES =====
    image: z.string().optional(),
    images: z.array(z.string()).default([]),
    
    // ===== TAGS & FEATURES =====
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    bestSeller: z.boolean().default(false),
    newArrival: z.boolean().default(false),
    
    // ===== SEO =====
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }),
});

export const collections = {
  products: productsCollection,
};