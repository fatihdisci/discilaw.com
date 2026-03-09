# İçerik Üretim ve Teknik Standartlar

## Blog yazısı ekleme
1. Keystatic panelinde **Makaleler** koleksiyonundan yeni kayıt açın.
2. Başlık alanında URL'ye uygun, açık bir ifade kullanın.
3. Açıklama en az 90 karakter olmalıdır.
4. En az 2 etiket seçin ve kategori atayın.
5. Kapak görseli yükleyin (öneri: **1200x630**, webp/jpg, 300KB altı).

## SEO alanlarını doldurma
- **Başlık:** Ana konu + hukuki bağlam içermeli.
- **Description:** 140-180 karakter aralığında, kullanıcı niyetini karşılayan özet yazın.
- **Kategori/Etiket:** Tekrarlı kavramlardan kaçının, kontrollü listedeki etiketleri kullanın.

## Görsel standartları
- Blog kartları için yatay oran kullanın (16:9).
- Kapak görselinde metin yoğunluğu düşük tutulmalı.
- Her yazıda `alt` metni başlıkla uyumlu olmalı.
- Dosya adı önerisi: `konu-yil-kisa-aciklama.jpg` (ör. `kira-hukuku-2026-tahliye-suresi.jpg`).

## Kategori / etiket kuralları
- Kategori tek ve net olmalı.
- Etiket en az 2 adet seçilmeli.
- Aynı kavram için farklı yazımlar kullanılmamalı (örn: `iş hukuku` / `is-hukuku` karmaşası yok).
- Etiketler sadece kontrollü slug sözlüğünden seçilir.

## Güncel etiket sözlüğü (özet)
`yargitay-karari`, `ceza-hukuku`, `is-hukuku`, `kira-hukuku`, `idare-hukuku`, `gayrimenkul-hukuku`, `miras-hukuku`, `ticaret-hukuku`, `hizmet-tespiti`, `tahliye-davasi`, `ihtiyac-nedeniyle-tahliye`, `tapu-iptali`, `zilyetlik`, `imar-plani`, `sgk`, `cezai-sart` vb.

## Eski içerik tag migration notu
- Eski içeriklerdeki serbest etiketler normalize edilmiştir.
- Örnek dönüşümler:
  - `Ceza Hukuku` → `ceza-hukuku`
  - `iş hukuku` → `is-hukuku`
  - `Yargıtay Kararları` → `yargitay-karari`
- Amaç: related posts ve filtreleme mantığında tutarlı taksonomi.

## Blog yayın öncesi minimum kalite kontrol
1. Başlık ve açıklama birbiriyle uyumlu mu?
2. Görsel oranı ve dosya boyutu uygun mu?
3. Kategori doğru seçildi mi?
4. En az 2 etiket seçildi mi?
5. İçerikte en az bir mevzuat/karar referansı var mı?

## Hizmet sayfası içerik mantığı
- İlk paragrafta hizmetin kapsamı ve kim için uygun olduğu net anlatılmalı.
- Hizmet metinlerinde mümkünse SSS bölümü eklenmeli.
- SSS varsa otomatik `FAQPage` schema üretildiği için soru-cevaplar açık ve kısa yazılmalı.
