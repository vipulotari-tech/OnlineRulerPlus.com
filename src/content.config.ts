import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().min(10).max(110),
    seoTitle: z.string().min(20).max(65),
    description: z.string().min(100).max(165),
    primaryKeyword: z.string().min(3),
    secondaryKeywords: z.array(z.string()).min(1),
    category: z.enum([
      'ruler-fundamentals',
      'measuring-without-tools',
      'unit-conversions',
      'screen-calibration',
      'printable-practical',
    ]),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    directAnswer: z.string().min(60),
    ogImage: z.string().startsWith('/'),
    ogImageAlt: z.string().min(15),
    heroDiagram: z.string().startsWith('/'),
    heroDiagramAlt: z.string().min(15),
    heroDiagramCaption: z.string().optional(),
    recommendedTools: z
      .array(
        z.object({
          label: z.string(),
          href: z.string().startsWith('/'),
          desc: z.string(),
        }),
      )
      .min(1),
    faqs: z
      .array(
        z.object({
          q: z.string().min(8),
          a: z.string().min(40),
        }),
      )
      .min(2),
    relatedSlugs: z.array(z.string()).min(2),
    sources: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
          note: z.string().optional(),
        }),
      )
      .min(1),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
