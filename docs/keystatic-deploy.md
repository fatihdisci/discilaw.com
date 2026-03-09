# Keystatic deploy notları (Vercel)

Bu repo, uzak admin panel erişimi için **Keystatic Cloud mode** ile yapılandırıldı (birinci tercih).

## Repo içinde yapılan teknik değişiklikler

- `keystatic.config.ts` içindeki storage local moddan Cloud mode'a geçirildi.
- `src/pages/keystatic.astro` oluşturuldu, admin panel route'u üretimde açıldı.
- `src/components/KeystaticPage.tsx` oluşturuldu (Keystatic UI entrypoint).
- `.env.example` güncellendi.

## Vercel environment variable'ları

Aşağıdakini Vercel projesine ekleyin (Production + Preview + Development):

- `KEYSTATIC_CLOUD_PROJECT`
  - Keystatic Cloud dashboard'da oluşturduğunuz proje kimliği.

## Vercel dışı manuel adımlar (Keystatic Cloud)

1. Keystatic Cloud'da proje oluşturun.
2. Projeyi `fatihdisci/discilaw.com` reposu ile eşleyin.
3. Cloud panelde gerekli GitHub yetkilerini verin.
4. Cloud project ID değerini alın (`KEYSTATIC_CLOUD_PROJECT`).
5. Vercel'e env ekleyip redeploy alın.

## Admin panel URL

- Üretim: `https://www.discilaw.com/keystatic`

## Çalışma prensibi

- Editör `/keystatic` üzerinden Keystatic Cloud kimlik doğrulaması ile giriş yapar.
- İçerik değişiklikleri Keystatic Cloud üzerinden repo yazma akışı ile yönetilir.
- Mevcut koleksiyon yapısı (`blog`, `services`) korunmuştur.

## Cloud tamamlanamazsa fallback

Cloud tarafındaki hesap/proje/repo yetkilendirme adımları panel merkezli olduğundan repo içinden tek başına tamamlanamaz.
Bu durumda `storage.kind: 'github'` moduna geçilip GitHub OAuth env'leriyle ikinci tercih uygulanabilir.
