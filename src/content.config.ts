import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().min(10).max(70),
    description: z.string().min(80).max(160),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).nonempty(),
    series: z.string().optional(),
    seriesOrder: z.number().int().positive().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    draft: z.boolean().default(false),
    canonicalUrl: z.string().url().optional(),
    ogImage: z.string().optional(),
    sources: z
      .array(
        z.object({
          title: z.string(),
          url: z.string().url(),
          publisher: z.string().optional(),
        }),
      )
      .optional(),
    email: z.boolean().default(true),
    emailSubject: z.string().optional(),
    emailPreview: z.string().optional(),
  }),
});

export const collections = { blog };
