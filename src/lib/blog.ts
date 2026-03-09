import type { CollectionEntry } from 'astro:content';

type BlogEntry = CollectionEntry<'blog'>;

const normalize = (value: string) => value.trim().toLocaleLowerCase('tr-TR');

export function normalizeTag(tag: string) {
  return normalize(tag).replace(/\s+/g, '-');
}

export function getRelatedPosts(currentPost: BlogEntry, allPosts: BlogEntry[], limit = 4) {
  const currentCategory = normalize(currentPost.data.category || '');
  const currentTags = (currentPost.data.tags || []).map(normalizeTag);

  const scored = allPosts
    .filter((post) => post.slug !== currentPost.slug)
    .map((post) => {
      const category = normalize(post.data.category || '');
      const tags = (post.data.tags || []).map(normalizeTag);
      const categoryScore = category && currentCategory && category === currentCategory ? 3 : 0;
      const tagScore = tags.filter((tag) => currentTags.includes(tag)).length;
      return { post, score: categoryScore + tagScore };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf())
    .slice(0, limit)
    .map((entry) => entry.post);

  return scored;
}
