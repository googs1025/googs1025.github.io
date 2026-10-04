import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";

import { SITE } from "@/data/site";
import { publishedPosts } from "@/lib/posts.mjs";

export const GET: APIRoute = async ({ site }) => {
  const posts = publishedPosts(
    await getCollection("blog"),
  ) as CollectionEntry<"blog">[];

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: post.data.canonicalURL ?? `/posts/${post.id}/`,
    })),
  });
};
