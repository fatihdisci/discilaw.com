# Admin panel kurulum adımları

Bu doküman, hangi adımın repo içinde, hangisinin dış panelde yapılacağını netleştirir.

## A) Repo içinde yapılanlar

- Keystatic local mod kaldırıldı.
- Keystatic Cloud mode'a geçildi.
- `/keystatic` admin route'u eklendi.
- Koleksiyon yapısı (`blog`, `services`) korunarak bırakıldı.

## B) Vercel panelinde yapılacaklar

Vercel > Project > Settings > Environment Variables:

- `KEYSTATIC_CLOUD_PROJECT`

Bu değişkeni **Production / Preview / Development** ortamlarının tamamına ekleyin.

## C) Keystatic Cloud panelinde yapılacaklar

1. Keystatic Cloud hesabı açın / giriş yapın.
2. Yeni proje oluşturun.
3. Repo bağlantısını `fatihdisci/discilaw.com` olarak kurun.
4. Gerekli GitHub izinlerini verin.
5. Project ID'yi alıp Vercel env'e yazın.

## D) Son doğrulama

1. Vercel redeploy sonrası: `https://www.discilaw.com/keystatic`
2. Giriş ekranı açılmalı.
3. `blog` ve `services` koleksiyonları görünmeli.
4. İçerik kaydetme akışı Cloud üzerinden çalışmalı.

## E) Fallback (GitHub mode)

Cloud adımları kurum/panel kısıtı nedeniyle tamamlanamazsa:

- `storage.kind` değeri `github` yapılır.
- Vercel env olarak aşağıdakiler eklenir:
  - `KEYSTATIC_SECRET`
  - `KEYSTATIC_GITHUB_CLIENT_ID`
  - `KEYSTATIC_GITHUB_CLIENT_SECRET`
- GitHub OAuth callback URL:
  - `https://www.discilaw.com/api/keystatic/github/oauth/callback`
