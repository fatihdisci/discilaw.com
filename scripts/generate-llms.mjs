// Build-time script: generates public/llms.txt and public/llms-full.txt
// from MDX frontmatter + body. Runs before `astro build`.
// Standard reference: https://llmstxt.org

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://discilaw.com';
const SITE_NAME = 'Dişçi Hukuk Bürosu';
const TAGLINE =
  "İzmir Karşıyaka merkezli hukuk bürosu. Av. Fatih Dişçi tarafından yönetilen Dişçi Hukuk Bürosu; aile, ceza, iş, gayrimenkul, ticaret, idare, icra, bilişim hukuku ve şirket danışmanlığı alanlarında dava takibi ve hukuki danışmanlık hizmeti sunmaktadır.";

const CONTACT = {
  tel: '+90 507 724 77 35',
  email: 'info@discilaw.com',
  address: 'Tuna Mah. 1690. Sk. No:1 K:6 D:601, Karşıyaka, İzmir',
};

const CALCULATORS = [
  {
    title: 'Kıdem Tazminatı Hesaplama',
    url: `${SITE}/hesaplama-araclari/kidem-tazminati`,
    desc: 'Geçmiş dönem kıdem tavanı dahil, güncel verilerle net kıdem tazminatı hesaplama.',
  },
  {
    title: 'İhbar Tazminatı Hesaplama',
    url: `${SITE}/hesaplama-araclari/ihbar-tazminati`,
    desc: 'Hizmet süresi ve vergi dilimine göre ihbar tazminatı hesaplama.',
  },
  {
    title: 'Avukatlık Ücreti Hesaplama (AAÜT 2025-2026)',
    url: `${SITE}/hesaplama-araclari/avukatlik-ucreti`,
    desc: 'Avukatlık Asgari Ücret Tarifesi uyarınca dava ve icra takipleri için ücret hesaplama.',
  },
];

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const yaml = match[1];
  const body = match[2];
  const data = {};
  let currentKey = null;
  let buffer = [];

  const flush = () => {
    if (currentKey === null) return;
    const joined = buffer.join('\n').trim();
    data[currentKey] = joined.replace(/^>-\s*/, '').replace(/\s+/g, ' ').trim();
    currentKey = null;
    buffer = [];
  };

  for (const line of yaml.split(/\r?\n/)) {
    if (/^[a-zA-Z_][\w-]*:/.test(line)) {
      flush();
      const idx = line.indexOf(':');
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (val === '' || val === '>-' || val === '>' || val === '|') {
        currentKey = key;
        buffer = [];
      } else {
        data[key] = val.replace(/^['"]|['"]$/g, '');
      }
    } else if (currentKey) {
      buffer.push(line);
    }
  }
  flush();
  return { data, body };
}

async function readCollection(dir) {
  const full = path.join(ROOT, 'src', 'content', dir);
  if (!existsSync(full)) return [];
  const files = await readdir(full);
  const items = [];
  for (const file of files) {
    if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue;
    const raw = await readFile(path.join(full, file), 'utf-8');
    const { data, body } = parseFrontmatter(raw);
    items.push({ slug: file.replace(/\.(mdx|md)$/, ''), data, body });
  }
  return items;
}

function stripMdx(body) {
  return body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^import .*$/gm, '')
    .replace(/^export .*$/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildLlmsTxt(services, posts) {
  const sortedPosts = [...posts].sort((a, b) => {
    const ad = new Date(a.data.pubDate || 0).getTime();
    const bd = new Date(b.data.pubDate || 0).getTime();
    return bd - ad;
  });

  const lines = [];
  lines.push(`# ${SITE_NAME}`);
  lines.push('');
  lines.push(`> ${TAGLINE}`);
  lines.push('');
  lines.push('## Çalışma Alanları');
  for (const s of services) {
    lines.push(
      `- [${s.data.title}](${SITE}/calisma-alanlarimiz/${s.slug}): ${s.data.description}`
    );
  }
  lines.push('');
  lines.push('## Hesaplama Araçları');
  for (const c of CALCULATORS) {
    lines.push(`- [${c.title}](${c.url}): ${c.desc}`);
  }
  lines.push('');
  lines.push('## Son Blog Yazıları');
  for (const p of sortedPosts.slice(0, 15)) {
    lines.push(`- [${p.data.title}](${SITE}/blog/${p.slug}): ${p.data.description}`);
  }
  lines.push('');
  lines.push('## İletişim');
  lines.push(`- Telefon: ${CONTACT.tel}`);
  lines.push(`- E-posta: ${CONTACT.email}`);
  lines.push(`- Adres: ${CONTACT.address}`);
  lines.push(`- Web: ${SITE}`);
  lines.push('');
  lines.push('## Optional');
  lines.push(`- [İletişim Sayfası](${SITE}/iletisim)`);
  lines.push(`- [Tüm Blog](${SITE}/blog)`);
  lines.push(`- [Tüm Çalışma Alanları](${SITE}/calisma-alanlarimiz)`);
  lines.push(`- [Gizlilik Politikası](${SITE}/yasal/gizlilik-politikasi)`);
  lines.push(`- [Aydınlatma Metni](${SITE}/yasal/aydinlatma-metni)`);
  lines.push('');
  return lines.join('\n');
}

function buildLlmsFullTxt(services, posts) {
  const sortedPosts = [...posts].sort((a, b) => {
    const ad = new Date(a.data.pubDate || 0).getTime();
    const bd = new Date(b.data.pubDate || 0).getTime();
    return bd - ad;
  });

  const out = [];
  out.push(`# ${SITE_NAME} — Tam İçerik`);
  out.push('');
  out.push(`> ${TAGLINE}`);
  out.push('');
  out.push('---');
  out.push('');
  out.push('# Çalışma Alanları');
  out.push('');
  for (const s of services) {
    out.push(`## ${s.data.title}`);
    out.push(`URL: ${SITE}/calisma-alanlarimiz/${s.slug}`);
    out.push('');
    out.push(s.data.description);
    out.push('');
    const body = stripMdx(s.body);
    if (body) {
      out.push(body);
      out.push('');
    }
    out.push('---');
    out.push('');
  }
  out.push('# Blog Yazıları');
  out.push('');
  for (const p of sortedPosts) {
    out.push(`## ${p.data.title}`);
    out.push(`URL: ${SITE}/blog/${p.slug}`);
    if (p.data.pubDate) out.push(`Tarih: ${p.data.pubDate}`);
    if (p.data.category) out.push(`Kategori: ${p.data.category}`);
    out.push('');
    out.push(p.data.description);
    out.push('');
    const body = stripMdx(p.body);
    if (body) {
      out.push(body);
      out.push('');
    }
    out.push('---');
    out.push('');
  }
  return out.join('\n');
}

async function main() {
  const services = await readCollection('services');
  const posts = await readCollection('blog');

  const publicDir = path.join(ROOT, 'public');
  if (!existsSync(publicDir)) await mkdir(publicDir, { recursive: true });

  const llms = buildLlmsTxt(services, posts);
  const llmsFull = buildLlmsFullTxt(services, posts);

  await writeFile(path.join(publicDir, 'llms.txt'), llms, 'utf-8');
  await writeFile(path.join(publicDir, 'llms-full.txt'), llmsFull, 'utf-8');

  console.log(
    `[generate-llms] Wrote llms.txt (${services.length} services, ${posts.length} posts) and llms-full.txt`
  );
}

main().catch((err) => {
  console.error('[generate-llms] Failed:', err);
  process.exit(1);
});
