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
    () =>
      posts.map((post) => ({
        ...post,
        normalizedCategory: post.data.category || 'Genel',
        queryBlob: `${post.data.title} ${post.data.description}`.toLocaleLowerCase('tr-TR'),
      })),
    [posts]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    normalized.forEach((post) => {
      counts[post.normalizedCategory] = (counts[post.normalizedCategory] || 0) + 1;
    });
    return counts;
  }, [normalized]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('tr-TR');
    return normalized.filter((post) => {
      const categoryMatch = selectedCategory ? post.normalizedCategory === selectedCategory : true;
      const queryMatch = query ? post.queryBlob.includes(query) : true;
      return categoryMatch && queryMatch;
    });
  }, [normalized, searchQuery, selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage));
  const currentPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Makale ara..."
            className="w-full pl-4 pr-10 py-3 rounded-xl border focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all"
            style={{ background: 'var(--bg-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--text-3)' }} aria-label="Aramayı temizle">
              ✕
            </button>
          )}
        </div>

        {(searchQuery || selectedCategory) && (
          <p className="text-sm mt-3 text-center" style={{ color: 'var(--text-3)' }}>
            {filteredPosts.length} sonuç bulundu {selectedCategory && <span className="text-gold-500">({selectedCategory})</span>}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 sm:px-4 py-2 border rounded-full text-sm transition-colors ${selectedCategory === '' ? 'border-gold-500 bg-gold-500/20 text-gold-500' : ''}`}
          style={selectedCategory === '' ? {} : { borderColor: 'var(--border)', color: 'var(--text-2)' }}
        >
          Tümü <span className="text-xs">({posts.length})</span>
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory((prev) => (prev === category ? '' : category))}
            className={`px-3 sm:px-4 py-2 border rounded-full text-sm transition-colors ${selectedCategory === category ? 'border-gold-500 bg-gold-500/20 text-gold-500' : ''}`}
            style={selectedCategory === category ? {} : { borderColor: 'var(--border)', color: 'var(--text-2)' }}
          >
            {category} <span className="text-xs">({categoryCounts[category] || 0})</span>
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-full text-sm text-gold-500">
            Aktif filtre: {selectedCategory}
            <button onClick={() => setSelectedCategory('')} className="hover:text-gold-300" aria-label="Kategori filtresini kaldır">✕</button>
          </div>
        </div>
      )}

      {currentPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {currentPosts.map((post) => (
              <article key={post.slug} className="rounded-2xl overflow-hidden border transition-colors hover:border-gold-500/30 h-full flex flex-col" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                {post.data.image ? <img src={post.data.image} alt={post.data.title} width={800} height={450} loading="lazy" decoding="async" className="w-full h-48 object-cover" /> : <div className="h-48" style={{ background: 'var(--bg-3)' }} />}
                <div className="p-5 sm:p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-3)' }}>
                    <time>{new Date(post.data.pubDate).toLocaleDateString('tr-TR')}</time>
                    <span>{post.data.category || 'Genel'}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold font-display line-clamp-2" style={{ color: 'var(--text)' }}><a href={`/blog/${post.slug}`} className="hover:text-gold-500 transition-colors">{post.data.title}</a></h2>
                  <p className="text-sm line-clamp-3" style={{ color: 'var(--text-2)' }}>{post.data.description}</p>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <PaginationButton onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>Önceki</PaginationButton>
              <span className="text-sm" style={{ color: 'var(--text-3)' }}>{currentPage} / {totalPages}</span>
              <PaginationButton onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>Sonraki</PaginationButton>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-14 border rounded-2xl" style={{ borderColor: 'var(--border)', background: 'var(--bg-2)' }}>
          <h3 className="text-xl font-display mb-2" style={{ color: 'var(--text)' }}>Sonuç bulunamadı</h3>
          <p className="mb-4" style={{ color: 'var(--text-3)' }}>Farklı bir arama terimi veya kategori deneyebilirsiniz.</p>
          {(searchQuery || selectedCategory) && (
            <button onClick={clearFilters} className="px-4 py-2 rounded-lg bg-gold-500 font-semibold hover:bg-gold-400 transition-colors" style={{ color: 'var(--bg)' }}>Filtreleri Temizle</button>
          )}
        </div>
      )}
    </div>
  );
}
