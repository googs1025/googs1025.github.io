import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

import {
  isHttpUrl,
  isLegacyPath,
  isUpdatedDateOnOrAfterPubDate,
} from "./lib/content-validation.mjs";

const blog = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z
    .object({
      title: z.string().min(1),
      description: z.string().min(1),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      categories: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      canonicalURL: z
        .string()
        .refine(isHttpUrl, { error: "canonicalURL must be an HTTP(S) URL" })
        .optional(),
      legacyURLs: z
        .array(
          z.string().refine(isLegacyPath, {
            error: "legacyURLs entries must be same-origin pathnames",
          }),
        )
        .default([]),
    })
    .refine(
      ({ pubDate, updatedDate }) =>
        isUpdatedDateOnOrAfterPubDate(pubDate, updatedDate),
      {
        error: "updatedDate must be on or after pubDate",
        path: ["updatedDate"],
      },
    ),
});

export const collections = { blog };
