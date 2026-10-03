import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { isHttpUrl, seriesFieldIssue } from './lib/schema';

const httpUrl = z.string().url().refine(isHttpUrl, { message: 'Must be an http(s) URL' });

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
    canonicalUrl: httpUrl.optional(),
    ogImage: z.string().optional(),
    sources: z
      .array(
        z.object({
          title: z.string(),
          url: httpUrl,
          publisher: z.string().optional(),
        }),
      )
      .optional(),
    email: z.boolean().default(true),
    emailSubject: z.string().optional(),
    emailPreview: z.string().optional(),
  })
    .superRefine((data, ctx) => {
      const issue = seriesFieldIssue(data);
      if (issue) ctx.addIssue({ code: 'custom', path: ['seriesOrder'], message: issue });
    }),
});

export const collections = { blog };
