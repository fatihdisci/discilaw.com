# discilaw.com

Astro 5, TypeScript ve Tailwind CSS v4 tabanlı Dişçi Hukuk Bürosu web sitesi. Güvenli müvekkil portalı `/portal` altında Supabase Auth, Postgres, private Storage ve RLS kullanır.

## Yerelde çalıştırma

```bash
npm install
cp .env.example .env
npm run dev
```

`.env` içinde en az `PUBLIC_SUPABASE_URL` ve `PUBLIC_SUPABASE_PUBLISHABLE_KEY` değerlerini doldurun. Site `http://localhost:4321`, portal `http://localhost:4321/portal` adresinde açılır.

Supabase şeması, ilk admin hesabı, Auth URL'leri, Storage ve Edge Function kurulumu için [docs/portal-kurulum.md](docs/portal-kurulum.md) dosyasını izleyin.

## Doğrulama

```bash
npx astro check
npm run build
```
