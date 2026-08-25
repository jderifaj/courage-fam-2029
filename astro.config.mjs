// @ts-check
import { defineConfig } from 'astro/config';

// `npm run build` runs scripts/optimize-images.mjs explicitly before `astro
// build`, but `astro dev` has no such wrapper — without this, uploaded
// photos 404 in dev because their .opt.webp derivative was never generated.
const optimizeImagesOnDevStart = {
  name: 'optimize-images-on-dev-start',
  hooks: {
    'astro:server:setup': async () => {
      await import('./scripts/optimize-images.mjs');
    },
  },
};

// https://astro.build/config
export default defineConfig({
  integrations: [optimizeImagesOnDevStart],
});
