import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.discilaw.com',
  base: '/',
  output: 'hybrid',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [keystatic(), react(), mdx(), sitemap(), markdoc()],
});
