import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const families = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/families' }),
  schema: () => z.object({
    familyName: z.string(),
    playerName: z.string(),
    jerseyNumber: z.number().optional(),
    photo: z.string(),
    photoAlt: z.string().optional(),
    order: z.number().default(0),
  }),
});

const coaches = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/coach' }),
  schema: () => z.object({
    name: z.string(),
    role: z.string().default('Coach'),
    email: z.string().email().optional(),
    photo: z.string(),
    photoAlt: z.string().optional(),
  }),
});

export const collections = { families, coaches };
