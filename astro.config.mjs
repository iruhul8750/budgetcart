import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://budgetcart.onrender.com',
  integrations: [
    tailwind(),
  ]
});