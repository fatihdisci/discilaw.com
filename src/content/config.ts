import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().min(90),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    image: z.string(),
    imageAlt: z.string().optional(),
    category: z.string(),
    author: z.string().optional(),
    tags: z.array(z.string()).min(2),
    instagramUrl: z.string().url().optional(),
    miniFaqs: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    quickAnswer: z
      .object({
        intro: z.string(),
        highlights: z.array(z.string()).min(2).max(6),
      })
      .optional(),
  }),
});

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
  }),
});

export const collections = { blog, services };
