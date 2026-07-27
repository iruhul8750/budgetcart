import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:10000',  // ✅ Uses env var or fallback
  output: 'server',  // ✅ SSR for both dev and prod
  adapter: node({
    mode: 'standalone',  // ✅ Production-ready
  }),
  integrations: [tailwind()],
  server: {
    port: 10000,
    host: '0.0.0.0',  // ✅ Allows external access
  },
});