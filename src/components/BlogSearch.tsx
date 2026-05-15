import { useMemo, useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
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

  const inputStyle = {
    background: 'var(--bg-elevated)',
    borderColor: 'var(--border)',
    color: 'var(--ink-strong)',
    fontFamily: 'var(--font-sans)',
  };

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            size={18}
            style={{ color: 'var(--ink-muted)' }}
            aria-hidden="true"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Makale ara..."
            className="w-full pl-11 pr-10 py-3 border focus:outline-none transition-colors"
            style={{
              ...inputStyle,
              borderRadius: 'var(--radius-md)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--brand)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-soft)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 rounded transition-colors"
              style={{ color: 'var(--ink-muted)' }}
              aria-label="Aramayı temizle"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {(searchQuery || selectedCategory) && (
          <p
            className="mt-3 text-center"
            style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem' }}
          >
            {filteredPosts.length} sonuç bulundu{' '}
            {selectedCategory && (
              <span style={{ color: 'var(--brand-deep)', fontWeight: 500 }}>({selectedCategory})</span>
            )}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-10">
        <CategoryChip
          active={selectedCategory === ''}
          onClick={() => setSelectedCategory('')}
          label="Tümü"
          count={posts.length}
        />
        {categories.map((category) => (
          <CategoryChip
            key={category}
            active={selectedCategory === category}
            onClick={() => setSelectedCategory((prev) => (prev === category ? '' : category))}
            label={category}
            count={categoryCounts[category] || 0}
          />
        ))}
      </div>

      {currentPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {currentPosts.map((post) => (
              <SearchBlogCard key={post.slug} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div
              className="flex items-center justify-center gap-3 mt-12"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <PaginationButton
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Önceki
              </PaginationButton>
              <span style={{ color: 'var(--ink-muted)', fontSize: '0.875rem' }}>
                {currentPage} / {totalPages}
              </span>
              <PaginationButton
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sonraki
              </PaginationButton>
            </div>
          )}
        </>
      ) : (
        <div
          className="text-center py-14 px-6"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: '1.375rem',
              color: 'var(--ink-strong)',
              marginBottom: '0.5rem',
              letterSpacing: '-0.018em',
            }}
          >
            Sonuç bulunamadı
          </h3>
          <p
            style={{
              color: 'var(--ink-muted)',
              fontFamily: 'var(--font-sans)',
              marginBottom: '1.25rem',
            }}
          >
            Farklı bir arama terimi veya kategori deneyebilirsiniz.
          </p>
          {(searchQuery || selectedCategory) && (
            <button
              onClick={clearFilters}
              className="cursor-pointer transition-all"
              style={{
                background: 'var(--ink-strong)',
                color: 'var(--bg-base)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: '0.875rem',
                padding: '12px 22px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
              }}
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  const base = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    fontSize: '0.8125rem',
    padding: '0.5rem 0.95rem',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'background 200ms ease, color 200ms ease, border-color 200ms ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
  } as const;

  const activeStyle = {
    background: 'var(--brand-deep)',
    color: 'var(--bg-base)',
    borderColor: 'var(--brand-deep)',
  };

  const inactiveStyle = {
    background: 'transparent',
    color: 'var(--ink-default)',
    borderColor: 'var(--border)',
  };

  return (
    <button onClick={onClick} style={{ ...base, ...(active ? activeStyle : inactiveStyle) }}>
      {label}
      <span
        style={{
          fontSize: '0.6875rem',
          opacity: 0.75,
          fontWeight: 400,
        }}
      >
        ({count})
      </span>
    </button>
  );
}

function SearchBlogCard({ post }: { post: BlogPost & { normalizedCategory: string } }) {
  return (
    <article
      className="flex flex-col h-full overflow-hidden transition-all duration-300"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <a href={`/blog/${post.slug}`} className="block overflow-hidden cursor-pointer" style={{ height: '12rem' }}>
        {post.data.image ? (
          <img
            src={post.data.image}
            alt={post.data.title}
            width={800}
            height={450}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.04]"
            style={{ opacity: 0.94 }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'var(--brand-soft)', color: 'var(--brand-deep)' }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" />
              <path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" />
              <path d="M7 21h10" />
              <path d="M12 3v18" />
              <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
            </svg>
          </div>
        )}
      </a>
      <div className="p-5 sm:p-6 flex flex-col gap-3 flex-grow">
        <div
          className="flex items-center justify-between"
          style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}
        >
          <time>{new Date(post.data.pubDate).toLocaleDateString('tr-TR')}</time>
          <span style={{ color: 'var(--brand-deep)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {post.data.category || 'Genel'}
          </span>
        </div>
        <h2
          className="line-clamp-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: '1.25rem',
            lineHeight: 1.25,
            letterSpacing: '-0.018em',
            color: 'var(--ink-strong)',
          }}
        >
          <a
            href={`/blog/${post.slug}`}
            className="cursor-pointer transition-colors"
            style={{ color: 'inherit' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-deep)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
          >
            {post.data.title}
          </a>
        </h2>
        <p
          className="line-clamp-3"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem',
            lineHeight: 1.55,
            color: 'var(--ink-default)',
          }}
        >
          {post.data.description}
        </p>
      </div>
    </article>
  );
}
