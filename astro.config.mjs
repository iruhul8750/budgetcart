import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://budget-cart.onrender.com',
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [tailwind()],
  server: {
    host: '0.0.0.0',
    port: 10000,
  },
});