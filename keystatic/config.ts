import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: {
      owner: 'iruhul8750',
      name: 'budgetcart',
    },
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },
  secret: process.env.KEYSTATIC_SECRET,
  baseUrl: process.env.SITE_URL || 'http://localhost:4321',
  collections: {
    products: collection({
      label: 'Products',
      slugField: 'title',
      path: 'src/content/products/*',
      format: { contentField: 'body' },
      schema: {
        title: fields.slug({ name: { label: 'Product Title' } }),
        price: fields.text({ label: 'Price' }),
        category: fields.select({
          label: 'Category',
          options: [
            { value: 'tech', label: 'Tech' },
            { value: 'fashion', label: 'Fashion' },
            { value: 'home', label: 'Home' },
            { value: 'kitchen', label: 'Kitchen' },
            { value: 'gadgets', label: 'Gadgets' },
            { value: 'accessories', label: 'Accessories' },
          ],
        }),
        affiliateLink: fields.text({ label: 'Affiliate Link' }),
        platform: fields.select({
          label: 'Platform',
          options: [
            { value: 'amazon', label: 'Amazon' },
            { value: 'flipkart', label: 'Flipkart' },
            { value: 'myntra', label: 'Myntra' },
            { value: 'other', label: 'Other' },
          ],
        }),
        image: fields.image({
          label: 'Product Image',
          directory: 'public/images/products',
          publicPath: '/images/products',
        }),
        rating: fields.number({ label: 'Rating', validation: { min: 1, max: 5 } }),
        description: fields.text({ label: 'Short Description', multiline: true }),
        body: fields.markdown({ label: 'Full Review' }),
        pros: fields.array(fields.text({ label: 'Pro' }), { label: 'Pros' }),
        cons: fields.array(fields.text({ label: 'Con' }), { label: 'Cons' }),
        pubDate: fields.date({ label: 'Publication Date', defaultValue: { kind: 'today' } }),
      },
    }),
  },
});