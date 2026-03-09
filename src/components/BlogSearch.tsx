import { useMemo, useState, useEffect } from 'react';
import PaginationButton from './ui/PaginationButton';

type BlogPost = {
  slug: string;
  data: {
    title: string;
    description: string;
    pubDate: string;
    category?: string;
    image?: string;
  };
};

interface BlogSearchProps {
  posts: BlogPost[];
  categories: string[];
  postsPerPage?: number;
}

export default function BlogSearch({ posts, categories, postsPerPage = 6 }: BlogSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const normalized = useMemo(
    () => posts.map((post) => ({ ...post, queryBlob: `${post.data.title} ${post.data.description}`.toLocaleLowerCase('tr-TR') })),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('tr-TR');
    return normalized.filter((post) => {
      const categoryMatch = selectedCategory ? (post.data.category || 'Genel') === selectedCategory : true;
      const queryMatch = query ? post.queryBlob.includes(query) : true;
      return categoryMatch && queryMatch;
    });
  }, [normalized, searchQuery, selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto mb-8">
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Makale ara..." className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white" />
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <button onClick={() => setSelectedCategory('')} className={`px-4 py-2 border rounded-full text-sm ${selectedCategory === '' ? 'border-gold-500 bg-gold-500/20 text-gold-500' : 'border-slate-800 text-slate-300'}`}>Tümü</button>
        {categories.map((category) => (
          <button key={category} onClick={() => setSelectedCategory((prev) => (prev === category ? '' : category))} className={`px-4 py-2 border rounded-full text-sm ${selectedCategory === category ? 'border-gold-500 bg-gold-500/20 text-gold-500' : 'border-slate-800 text-slate-300'}`}>
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentPosts.map((post) => (
          <article key={post.slug} className="bg-slate-900/50 rounded-2xl overflow-hidden border border-white/5 h-full flex flex-col">
            {post.data.image ? <img src={post.data.image} alt={post.data.title} width={800} height={450} loading="lazy" decoding="async" className="w-full h-48 object-cover" /> : <div className="h-48 bg-slate-800" />}
            <div className="p-6 flex flex-col gap-3">
              <p className="text-xs text-slate-500">{new Date(post.data.pubDate).toLocaleDateString('tr-TR')}</p>
              <h2 className="text-xl font-bold text-white font-serif line-clamp-2"><a href={`/blog/${post.slug}`}>{post.data.title}</a></h2>
              <p className="text-slate-400 text-sm line-clamp-3">{post.data.description}</p>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <PaginationButton onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="border-slate-700 text-slate-300">Önceki</PaginationButton>
          <span className="text-sm text-slate-500">{currentPage} / {totalPages}</span>
          <PaginationButton onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="border-slate-700 text-slate-300">Sonraki</PaginationButton>
        </div>
      )}
    </div>
  );
}
