import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:10000',
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [tailwind()],
  server: {
    port: 10000,
    host: '0.0.0.0',
  },
});