import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import keystatic from '@keystatic/astro';

export default defineConfig({
  site: 'https://budget-cart.onrender.com',
  output: 'hybrid',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    tailwind(),
    keystatic({
      config: './keystatic/config.ts',
      route: '/keystatic',
    }),
  ],
});