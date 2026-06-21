import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://budgetcart.onrender.com',
  integrations: [
    tailwind(),
    sitemap(),
  ]
});