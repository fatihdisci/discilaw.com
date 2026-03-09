const SITE_URL = 'https://www.discilaw.com';
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

export function organizationSchema(site?: URL | string) {
  const origin = getSiteUrl(site).origin;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LegalService',
        '@id': `${origin}/#organization`,
        name: SITE_NAME,
        url: origin,
        telephone: '+905077247735',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Karşıyaka',
          addressLocality: 'İzmir',
          addressRegion: 'İzmir',
          postalCode: '35500',
          addressCountry: 'TR',
        },
        image: `${origin}/logo.png`,
        priceRange: '$$',
        founder: {
          '@type': 'Person',
          name: 'Av. Fatih Dişçi',
        },
      },
      {
        '@type': 'Attorney',
        '@id': `${origin}/#attorney`,
        name: 'Av. Fatih Dişçi',
        memberOf: {
          '@id': `${origin}/#organization`,
        },
        description: "İzmir Barosu'na kayıtlı avukat Fatih Dişçi tarafından yönetilen hukuk bürosu.",
        url: origin,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'İzmir',
          addressCountry: 'TR',
        },
      },
    ],
  };
}
