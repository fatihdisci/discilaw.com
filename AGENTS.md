# discilaw.com — Claude Code Kuralları

Bu dosyayı her oturumda oku. Değişiklik yapmadan önce buradaki kuralları uygula.

---

## GERÇEK STACK (doğrulanmış)

- **Framework**: Astro 5 + TypeScript
- **CSS**: Tailwind CSS **v4** — tema `@theme` direktifi ile `src/styles/global.css` içinde tanımlanır
- **tailwind.config.mjs** — sadece `@tailwindcss/typography` plugin için var, renk/font buraya EKLEME
- **Fonts**: Inter (body/sans) + Playfair Display (serif) → bunlar DEĞİŞECEK
- **İçerik**: MDX + Markdoc + Keystatic CMS
- **Deploy**: Vercel (static output)
- **React islands**: WhatsAppButton.tsx, ServiceIcon.tsx, Radix NavigationMenu

---

## DOKUNMA — ASLA DEĞİŞTİRME

- `keystatic.config.ts` — CMS şema tanımları
- `src/content/` — tüm blog ve içerik dosyaları
- `src/lib/seo.ts` — SEO utility, Layout.astro buna bağımlı
- `src/pages/hesaplama-araclari/` — hesaplama mantığı (JS/form logic)
- `src/components/WhatsAppButton.tsx` — sadece className güncelle, mantığa dokunma
- `src/components/ServiceIcon.tsx` — ikon logic'i, dokunma
- `src/components/Breadcrumbs.astro` — Layout'a bağlı, sadece stil güncelle
- `astro.config.mjs`
- `public/` — görseller (ana-resim.jpg, logo.png dahil)

---

## TAILWİND V4 — KRİTİK FARK

Bu proje Tailwind **v4** kullanıyor. v3'ten TAMAMEN farklı:

```css
/* global.css — DOĞRU v4 syntax: */
@import "tailwindcss";

@theme {
  --color-gold-500: #ab934d;   /* Tailwind class: text-gold-500 */
  --font-display: 'Cormorant Garamond', serif;  /* class: font-display */
}
```

**YANLIŞ**: `tailwind.config.mjs`'e `theme.extend.colors` ekleme — v4'te bu çalışmaz.
**DOĞRU**: Yeni token'lar `global.css` içindeki `@theme {}` bloğuna girer.

Dark mode için v4 syntax:
```css
/* global.css içine @theme bloğundan sonra ekle: */
@variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```
Bundan sonra `dark:bg-slate-800` gibi Tailwind class'ları çalışır.

---

## YENİ TASARIM SİSTEMİ

### 1. global.css güncellemesi

Mevcut `@theme {}` bloğunu şununla değiştir (gold palette'i KORU, yenileri ekle):

```css
@import "tailwindcss";

@theme {
  /* Mevcut gold — koru */
  --color-gold-50:  #fbf7ef;
  --color-gold-100: #f5edd8;
  --color-gold-200: #ead9b0;
  --color-gold-300: #dec084;
  --color-gold-400: #cca762;
  --color-gold-500: #ab934d;
  --color-gold-600: #96793f;
  --color-gold-700: #7a6034;
  --color-gold-800: #654f2e;
  --color-gold-900: #544129;
  --color-gold-950: #2e2315;

  /* YENİ fontlar */
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body:    'Outfit', 'Inter', sans-serif;
  --font-sans:    'Outfit', 'Inter', sans-serif;  /* Tailwind default override */
  --font-serif:   'Cormorant Garamond', Georgia, serif;
}

/* Dark mode variant — v4 syntax */
@variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

/* CSS değişkenleri — light/dark tema */
@layer base {
  :root {
    --bg:        #FFFFFF;
    --bg-2:      #F8F7F4;
    --bg-3:      #F0EDE6;
    --border:    #E4E0D8;
    --text:      #0D0C0A;
    --text-2:    #4A4845;
    --text-3:    #8C8A86;
    --navy:      #1B3550;
    --card-bg:   #FFFFFF;
    --nav-bg:    rgba(255,255,255,0.92);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.08);
  }

  [data-theme="dark"] {
    --bg:        #0C0B09;
    --bg-2:      #131210;
    --bg-3:      #1A1916;
    --border:    #2A2925;
    --text:      #F2EFE8;
    --text-2:    #B0ADA6;
    --text-3:    #6B6864;
    --navy:      #4A90C4;
    --card-bg:   #131210;
    --nav-bg:    rgba(12,11,9,0.92);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.4);
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Outfit', 'Inter', sans-serif;
    transition: background 0.3s, color 0.3s;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      transition: none !important;
      animation: none !important;
    }
  }
}

/* Blog prose override — güncelle */
@layer components {
  .prose h2 { @apply text-gold-500 font-bold mt-10 mb-6 text-2xl; font-family: var(--font-display); }
  .prose h3 { @apply text-gold-500 font-bold mt-8 mb-4 text-xl; font-family: var(--font-display); }
  .prose p  { @apply mb-6 leading-relaxed; }
  .prose strong { @apply font-bold; color: var(--text); }
  .prose a  { @apply text-gold-500 hover:text-gold-400 no-underline hover:underline; }
  .prose blockquote { @apply border-l-4 border-gold-500 pl-4 italic my-6; color: var(--text-2); }
  .prose ul { @apply mb-6 pl-5 list-disc marker:text-gold-500; }
  .prose ol { @apply mb-6 pl-5 list-decimal marker:text-gold-500; }
  .prose li { @apply mb-2 pl-2; }
}

@layer utilities {
  .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
}
```

### 2. Layout.astro güncellemeleri

**a) `<html>` tag'ı:**
```astro
<html lang="tr" data-theme="light" class="scroll-smooth">
```

**b) `<head>` içine — GA script'lerinden ÖNCE:**
```astro
<script is:inline>
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
</script>
```

**c) Font bağlantılarını güncelle** (mevcut Inter+Playfair bağlantılarının YERİNE):
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap" media="print" onload="this.media='all'" />
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap" /></noscript>
```

**d) `<body>` class güncelle:**

Mevcut: `class="bg-slate-950 text-slate-300 selection:bg-gold-500/30 selection:text-gold-200 antialiased font-sans pt-32 md:pt-40 flex flex-col min-h-screen"`

Yeni: `class="antialiased pt-32 md:pt-40 flex flex-col min-h-screen selection:bg-gold-500/30 selection:text-gold-200"`

`pt-32 md:pt-40` KORU — navbar yüksekliği bu.

---

## NAVBAR GÜNCELLEMESİ

Mevcut yapıyı koru (links dizisi, dropdown logic, mobile toggle script).
Değiştir:

```astro
<!-- Eski: -->
<nav class="fixed w-full z-50 top-0 start-0 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">

<!-- Yeni: -->
<nav class="fixed w-full z-50 top-0 start-0 border-b backdrop-blur-md transition-colors"
     style="background: var(--nav-bg); border-color: var(--border);">
```

Nav link renkleri:
```astro
<!-- Eski: text-slate-300 ... hover:text-gold-500 -->
<!-- Yeni: -->
class="... transition-colors duration-200"
style="color: var(--text-2);"
onmouseover="this.style.color='var(--text)'"
onmouseout="this.style.color='var(--text-2)'"
```

**Dark mode toggle butonu ekle** (nav action'larının en soluna):
```astro
<button id="theme-toggle"
  class="w-9 h-9 rounded-lg border flex items-center justify-center cursor-pointer transition-colors"
  style="background: var(--bg-2); border-color: var(--border);"
  aria-label="Temayı değiştir">
  <svg id="icon-moon" width="16" height="16" viewBox="0 0 24 24" style="fill: var(--text-2);">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
  <svg id="icon-sun" width="16" height="16" viewBox="0 0 24 24" class="hidden" style="fill: var(--gold);">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/>
    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/>
    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/>
  </svg>
</button>

<script>
  const btn = document.getElementById('theme-toggle');
  const moon = document.getElementById('icon-moon');
  const sun = document.getElementById('icon-sun');
  function syncIcons() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    moon?.classList.toggle('hidden', dark);
    sun?.classList.toggle('hidden', !dark);
  }
  syncIcons();
  btn?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    syncIcons();
  });
</script>
```

**"Giriş" butonunu** "Müvekkil Girişi" olarak güncelle.

**"Open main menu"** → `<span class="sr-only">Menüyü Aç</span>`

---

## FOOTER GÜNCELLEMESİ

Mevcut yapıyı ve linkleri koru. Güncelle:

```astro
<!-- Eski: -->
<footer class="bg-slate-900 border-t border-slate-800 mt-auto">

<!-- Yeni: -->
<footer class="border-t mt-auto transition-colors" style="background: var(--bg-3); border-color: var(--border);">
```

Emoji'leri kaldır, SVG ikonlarla değiştir (AGENTS.md'de örnekler var).

Kolon başlıkları:
```astro
<!-- Eski: class="text-lg font-semibold text-white mb-4 font-serif" -->
<!-- Yeni: class="text-xs font-medium tracking-widest uppercase mb-4" style="color: var(--text-3);" -->
```

Link renkleri:
```astro
<!-- Eski: class="hover:text-gold-500 transition-colors" style="color: #94a3b8" -->
<!-- Yeni: class="hover:text-gold-500 transition-colors text-sm font-light" style="color: var(--text-2);" -->
```

---

## COMPONENT RENK MİGRASYONU

### KeyServices.astro

```astro
<!-- Section bg: -->
<!-- Eski: class="py-24 bg-slate-950/50 relative" -->
<!-- Yeni: class="py-24 relative" style="background: var(--bg);" -->

<!-- Kart: -->
<!-- Eski: class="... bg-slate-900 border border-slate-800 hover:border-gold-500/50 ..." -->
<!-- Yeni: class="... rounded-2xl border hover:border-gold-500/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer" style="background: var(--card-bg); border-color: var(--border);" -->

<!-- Kart başlık: -->
<!-- Eski: class="text-2xl font-bold text-white ... font-serif" -->
<!-- Yeni: class="text-2xl font-bold group-hover:text-gold-500 transition-colors font-display" style="color: var(--text);" -->

<!-- Kart açıklama: -->
<!-- Eski: class="text-slate-400 group-hover:text-slate-300 transition-colors" -->
<!-- Yeni: class="transition-colors text-sm font-light" style="color: var(--text-2);" -->

<!-- İkon kutusu: -->
<!-- Eski: class="w-16 h-16 bg-slate-800 rounded-xl ..." -->
<!-- Yeni: class="w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" style="background: var(--bg-2);" -->
```

### LatestPosts.astro

```astro
<!-- Section: -->
<!-- Eski: class="py-24 bg-slate-900 border-t border-slate-800" -->
<!-- Yeni: class="py-24 border-t" style="background: var(--bg-2); border-color: var(--border);" -->

<!-- Başlık: -->
<!-- Eski: class="text-3xl md:text-5xl font-bold text-white mb-4" -->
<!-- Yeni: class="text-3xl md:text-5xl font-light mb-4 font-display" style="color: var(--text);" -->
```

---

## BLOG VERİ YAPISI — KRİTİK

Blog post field adı `pubDate` — `date` DEĞİL:

```astro
// DOĞRU:
.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())

// YANLIŞ — YAPMA:
b.data.date  // Bu field yok, runtime hatası verir
```

---

## TİPOGRAFİ DÖNÜŞÜM TABLOSU

| Eski class | Yeni class / style |
|------------|-------------------|
| `font-sans` | `font-body` veya default |
| `font-serif` | `font-display` |
| `text-white` | `style="color: var(--text)"` |
| `text-slate-300` | `style="color: var(--text)"` |
| `text-slate-400` | `style="color: var(--text-2)"` |
| `text-slate-500` | `style="color: var(--text-3)"` |
| `bg-slate-950` | `style="background: var(--bg)"` |
| `bg-slate-900` | `style="background: var(--bg-2)"` |
| `bg-slate-800` | `style="background: var(--bg-3)"` |
| `border-slate-800` | `style="border-color: var(--border)"` |
| `text-3xl font-bold font-serif` | `text-3xl font-light font-display` |

---

## UYGULAMA SIRASI

1. `src/styles/global.css`
2. `src/layouts/Layout.astro` (html attr, script, font links, body class)
3. `src/components/Navbar.astro`
4. `src/components/Footer.astro`
5. `src/components/KeyServices.astro`
6. `src/components/LatestPosts.astro`
7. `src/components/blog/BlogCard.astro`
8. Diğer sayfalar

Her adımda: `npm run dev` → tarayıcıda kontrol → hata yoksa devam.
