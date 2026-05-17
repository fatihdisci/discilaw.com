import type { CollectionEntry } from 'astro:content';

type BlogEntry = CollectionEntry<'blog'>;

const normalize = (value: string) => value.trim().toLocaleLowerCase('tr-TR');

const CATEGORY_TO_SERVICE_SLUG: Record<string, { slug: string; title: string }> = {
  'ceza hukuku': { slug: 'ceza-hukuku', title: 'Ceza Hukuku' },
  'aile hukuku': { slug: 'aile-ve-bosanma', title: 'Aile ve Boşanma Hukuku' },
  'aile ve boşanma': { slug: 'aile-ve-bosanma', title: 'Aile ve Boşanma Hukuku' },
  'iş hukuku': { slug: 'is-hukuku', title: 'İş Hukuku' },
  'gayrimenkul hukuku': { slug: 'gayrimenkul-hukuku', title: 'Gayrimenkul Hukuku' },
  'kira hukuku': { slug: 'gayrimenkul-hukuku', title: 'Gayrimenkul Hukuku' },
  'icra hukuku': { slug: 'icra-hukuku', title: 'İcra Hukuku' },
  'idare hukuku': { slug: 'idare-hukuku', title: 'İdare Hukuku' },
  'bilişim hukuku': { slug: 'bilisim-hukuku', title: 'Bilişim Hukuku' },
  'ticaret hukuku': { slug: 'ticaret-hukuku', title: 'Ticaret Hukuku' },
  'şirket hukuku': { slug: 'sirket-danismanligi', title: 'Şirket Danışmanlığı' },
  'şirket danışmanlığı': { slug: 'sirket-danismanligi', title: 'Şirket Danışmanlığı' },
};

export function getServiceForCategory(category?: string) {
  if (!category) return null;
  return CATEGORY_TO_SERVICE_SLUG[normalize(category)] || null;
}

export function normalizeTag(tag: string) {
  return normalize(tag).replace(/\s+/g, '-');
}

export function getRelatedPosts(currentPost: BlogEntry, allPosts: BlogEntry[], limit = 4) {
  const currentCategory = normalize(currentPost.data.category || '');
  const currentTags = (currentPost.data.tags || []).map(normalizeTag);

  return allPosts
    .filter((post) => post.slug !== currentPost.slug)
    .map((post) => {
      const category = normalize(post.data.category || '');
      const tags = (post.data.tags || []).map(normalizeTag);
      const commonTags = tags.filter((tag) => currentTags.includes(tag)).length;
      const categoryMatch = category && currentCategory && category === currentCategory;
      const score = (categoryMatch ? 4 : 0) + commonTags;
      return { post, score, commonTags, categoryMatch };
    })
    .filter(({ categoryMatch, commonTags }) => categoryMatch || commonTags >= 2)
    .sort((a, b) => b.score - a.score || b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf())
    .slice(0, limit)
    .map((entry) => entry.post);
}
