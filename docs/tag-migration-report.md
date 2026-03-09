# Blog Tag Migration Raporu

## Kapsam
`src/content/blog` altındaki mevcut tüm yazılar tarandı.

## Kontroller
- `description`
- `image`
- `category`
- `tags`

## Sonuç
- Tüm içerikler `description >= 90`, `image mevcut`, `category mevcut`, `tags >= 2` koşullarını sağlıyor.
- Bu nedenle schema kuralları yumuşatılmadan korunmuştur.

## Uygulanan dönüşüm
Serbest etiketler slug standardına normalize edildi ve kontrollü sözlükle hizalandı.

Örnekler:
- `ceza hukuku` → `ceza-hukuku`
- `iş hukuku` → `is-hukuku`
- `yargıtay kararları` → `yargitay-karari`
- `idari para cezası` → `idari-para-cezasi`

## Etkilenen dosyalar
- `src/content/blog/*.mdx` (tamamı)
