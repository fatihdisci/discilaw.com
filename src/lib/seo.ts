const SITE_URL = 'https://discilaw.com';
const SITE_NAME = 'Dişçi Hukuk Bürosu';
const DEFAULT_DESCRIPTION = "İzmir Barosu'na kayıtlı Av. Fatih Dişçi tarafından kurulan Dişçi Hukuk Bürosu; Ceza, Aile ve İş Hukuku alanlarında hukuki danışmanlık hizmeti sunmaktadır.";
const DEFAULT_IMAGE = '/social-share.jpg';

export type SeoInput = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
};

export function getSiteUrl(site?: URL | string) {
  return new URL(site?.toString() || SITE_URL);
}

export function toAbsoluteUrl(url: string | URL | undefined, site?: URL | string) {
  if (!url) return new URL(DEFAULT_IMAGE, getSiteUrl(site)).href;
  try {
    return new URL(url.toString()).href;
  } catch {
    return new URL(url.toString().startsWith('/') ? url.toString() : `/${url.toString()}`, getSiteUrl(site)).href;
  }
}

export function buildPageTitle(title?: string) {
  if (!title || title.trim() === '' || title === SITE_NAME) return SITE_NAME;
  if (title.includes(`| ${SITE_NAME}`)) return title;
  return `${title} | ${SITE_NAME}`;
}

export function buildSeoMeta(input: SeoInput, currentPathname: string, site?: URL | string) {
  const canonical = toAbsoluteUrl(input.canonicalPath || currentPathname, site);
  const title = buildPageTitle(input.title);
  const description = input.description?.trim() || DEFAULT_DESCRIPTION;
  const image = toAbsoluteUrl(input.image || DEFAULT_IMAGE, site);

  return {
    title,
    description,
    canonical,
    image,
    type: input.type || 'website',
    noindex: input.noindex || false,
  };
}

const SERVICE_TYPES = [
  'Aile Hukuku',
  'Bilişim Hukuku',
  'Ceza Hukuku',
  'Gayrimenkul Hukuku',
  'İcra Hukuku',
  'İdare Hukuku',
  'İş Hukuku',
  'Şirket Danışmanlığı',
  'Ticaret Hukuku',
];

const SAME_AS = ['https://www.instagram.com/discihukukburosu/'];

export function organizationSchema(site?: URL | string) {
  const origin = getSiteUrl(site).origin;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LegalService',
        '@id': `${origin}/#organization`,
        name: SITE_NAME,
        alternateName: 'Dişçi Hukuk',
        url: `${origin}/`,
        telephone: '+90-507-724-7735',
        email: 'info@discilaw.com',
        image: `${origin}/logo.png`,
        logo: `${origin}/logo.png`,
        priceRange: '₺₺',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Tuna Mah. 1690. Sk. No:1 K:6 D:601',
          addressLocality: 'Karşıyaka',
          addressRegion: 'İzmir',
          postalCode: '35500',
          addressCountry: 'TR',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 38.4622,
          longitude: 27.1117,
        },
        areaServed: [
          { '@type': 'City', name: 'İzmir' },
          { '@type': 'Country', name: 'Türkiye' },
        ],
        serviceType: SERVICE_TYPES,
        sameAs: SAME_AS,
        founder: { '@id': `${origin}/#attorney` },
      },
      {
        '@type': ['Person', 'Attorney'],
        '@id': `${origin}/#attorney`,
        name: 'Av. Fatih Dişçi',
        jobTitle: 'Avukat',
        worksFor: { '@id': `${origin}/#organization` },
        memberOf: { '@id': `${origin}/#organization` },
        description: "İzmir Barosu'na kayıtlı avukat Fatih Dişçi tarafından yönetilen hukuk bürosu.",
        url: `${origin}/hakkimizda`,
        image: `${origin}/logo.png`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Karşıyaka',
          addressRegion: 'İzmir',
          addressCountry: 'TR',
        },
        sameAs: SAME_AS,
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: `${origin}/`,
        name: SITE_NAME,
        inLanguage: 'tr-TR',
        publisher: { '@id': `${origin}/#organization` },
      },
    ],
  };
}

export function serviceSchema(opts: {
  title: string;
  description: string;
  url: string;
  origin: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${opts.url}#service`,
    name: opts.title,
    description: opts.description,
    serviceType: opts.title,
    url: opts.url,
    inLanguage: 'tr-TR',
    provider: { '@id': `${opts.origin}/#organization` },
    areaServed: [
      { '@type': 'City', name: 'İzmir' },
      { '@type': 'Country', name: 'Türkiye' },
    ],
    mainEntityOfPage: opts.url,
  };
}

export function faqPageSchema(faqs: { question: string; answer: string }[], pageUrl?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    ...(pageUrl ? { '@id': `${pageUrl}#faq`, mainEntityOfPage: pageUrl } : {}),
    inLanguage: 'tr-TR',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function legalArticleSchema(opts: {
  title: string;
  description: string;
  url: string;
  origin: string;
  image: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  section?: string;
  keywords?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Article', 'LegalArticle'],
    '@id': `${opts.url}#article`,
    headline: opts.title,
    description: opts.description,
    image: [opts.image],
    inLanguage: 'tr-TR',
    author: { '@id': `${opts.origin}/#attorney`, '@type': 'Person', name: opts.authorName },
    publisher: { '@id': `${opts.origin}/#organization` },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    articleSection: opts.section || 'Genel',
    keywords: (opts.keywords || []).join(', '),
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
  };
}

export function webApplicationSchema(opts: {
  name: string;
  description: string;
  url: string;
  origin: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${opts.url}#app`,
    name: opts.name,
    description: opts.description,
    url: opts.url,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    inLanguage: 'tr-TR',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
    publisher: { '@id': `${opts.origin}/#organization` },
  };
}

export function howToSchema(opts: {
  name: string;
  description: string;
  url: string;
  steps: { name: string; text: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${opts.url}#howto`,
    name: opts.name,
    description: opts.description,
    inLanguage: 'tr-TR',
    step: opts.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}
