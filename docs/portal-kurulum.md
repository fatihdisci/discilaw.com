# Müvekkil portalı kurulum notları

Portal statik Astro uygulaması olarak `/portal` altında çalışır. Kimlik doğrulama, veri ve özel belgeler Supabase tarafından yönetilir. Tarayıcıda yalnızca publishable key bulunur; service role key hiçbir zaman site environment değişkenlerine veya istemci koduna eklenmez.

## 1. Supabase projesini bağlama

1. Supabase Dashboard'da bir proje oluşturun.
2. Project Settings > API Keys bölümünden Project URL ile **Publishable key** değerini alın.
3. Yerel `.env` dosyasına `.env.example` içindeki `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY` ve `PUBLIC_PORTAL_BASE_PATH=/portal` değerlerini ekleyin.
4. CLI ile çalışacaksanız `supabase login`, ardından `supabase link --project-ref <project-ref>` çalıştırın.

## 2. SQL migration ve Storage

Migration dosyası: `supabase/migrations/20260821063704_client_portal.sql`.

- CLI: `supabase db push`
- Alternatif: migration dosyasının tamamını Dashboard > SQL Editor içinde çalıştırın.

Migration şunları birlikte kurar:

- `profiles`, `cases`, `case_updates`, `submissions`, `documents` tabloları
- tüm portal tabloları için RLS ve en az yetki Data API grant'leri
- admin işlemlerinde zorunlu AAL2 politikaları
- private `portal-documents` bucket'ı
- 15 MB dosya limiti ve PDF/JPG/JPEG/PNG/DOCX MIME kısıtları
- Storage okuma/yükleme politikaları

Dashboard > Storage ekranında `portal-documents` bucket'ının **Private** olduğunu doğrulayın. Public yapmayın.

## 3. Auth URL'leri ve açık kaydı kapatma

Authentication > URL Configuration:

- Site URL: `https://discilaw.com`
- Redirect URL: `https://discilaw.com/portal?mode=setup`
- Yerel geliştirme için ayrıca: `http://localhost:4321/portal?mode=setup`

Authentication ayarlarında genel kullanıcı kaydını kapatın. Hesaplar yalnızca `invite-client` Edge Function üzerinden oluşturulur. Davet e-postalarının teslimi için üretimde kendi SMTP sağlayıcınızı yapılandırmanız önerilir; portal üçüncü parti ücretli bir servise bağımlı değildir.

## 4. Edge Function

Fonksiyon: `supabase/functions/invite-client/index.ts`.

```bash
supabase secrets set PORTAL_SITE_URL=https://discilaw.com PORTAL_ALLOWED_ORIGIN=https://discilaw.com PORTAL_REDIRECT_PATH=/portal
supabase functions deploy invite-client
```

Supabase, deploy edilen fonksiyona `SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY` değerlerini sağlar. Bu anahtarları Vercel'e eklemeyin. Fonksiyonun JWT doğrulamasını kapatmayın; çağıran kullanıcının aktif admin profili ve `aal2` oturumu ayrıca fonksiyon içinde doğrulanır.

## 5. İlk admin hesabı ve iki aşamalı doğrulama

1. Dashboard > Authentication > Users bölümünden kendi e-posta adresinizle kullanıcı oluşturun.
2. Oluşan UUID'yi kullanarak SQL Editor'da aşağıdakini çalıştırın:

```sql
insert into public.profiles (id, role, display_name, email, is_active)
values (
  '<AUTH_USER_UUID>',
  'admin',
  'Fatih Dişçi',
  '<ADMIN_EPOSTA>',
  true
);
```

3. `/portal` adresinden giriş yapın. İlk admin girişinde portal TOTP kurulumu açar.
4. QR kodunu bir doğrulayıcı uygulamayla tarayıp 6 haneli kodu doğrulayın.
5. Kurtarma amacıyla TOTP secret'ını parola yöneticinizde güvenli biçimde saklayın.

Admin tabloları ve Storage politikaları AAL2 olmadan çalışmaz. MFA'yı Dashboard'dan kaldırırsanız bir sonraki girişte portal yeniden kurulum ister.

## 6. Vercel environment değişkenleri

Production, Preview ve Development ortamlarına ekleyin:

```text
PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
PUBLIC_PORTAL_BASE_PATH=/portal
```

`SUPABASE_SERVICE_ROLE_KEY` eklemeyin. Değişkenleri kaydettikten sonra yeniden deploy edin.

## 7. Alt alana taşıma

`portal.discilaw.com` için ayrı deploy kullandığınızda Vercel'de `/` isteklerini statik `/portal` çıktısına rewrite edin; `PUBLIC_PORTAL_BASE_PATH=/`, `PORTAL_SITE_URL=https://portal.discilaw.com`, `PORTAL_ALLOWED_ORIGIN=https://portal.discilaw.com` ve `PORTAL_REDIRECT_PATH=/` yapın. Auth redirect URL'sini de yeni alan adıyla ekleyin. Portalın ayrı layout'u ve state tabanlı gezinmesi nedeniyle veri modeli ya da ana site sayfaları değişmez.

## 8. Son kontrol

- Davetsiz kayıt yapılamıyor.
- Admin MFA olmadan yönetim sorguları RLS tarafından reddediliyor.
- İki farklı test müvekkili birbirinin dosya, gönderi ve belgelerini göremiyor.
- İç kullanımlı belge ve `internal_note` müvekkilde görünmüyor.
- Belge URL'si public değil; yalnızca 60 saniyelik signed URL üretiliyor.
