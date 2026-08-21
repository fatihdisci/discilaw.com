-- Bu dosyadaki eski başlangıç şeması, güvenli müvekkil portalı migration'ı ile
-- değiştirilmiştir. Veri kaybını önlemek için eski tablolar migration içinde
-- körlemesine silinmez; profiles/cases verileri dönüştürülür, legacy expenses ve
-- notes tabloları yalnızca AAL2 yönetici erişimine kapatılır.
--
-- Güncel ve tek kaynak:
--   supabase/migrations/20260821063704_client_portal.sql
--
-- Supabase SQL Editor kullanıyorsanız yukarıdaki migration dosyasının tamamını
-- çalıştırın. CLI kullanıyorsanız docs/portal-kurulum.md adımlarını izleyin.

select 'Güncel şema: supabase/migrations/20260821063704_client_portal.sql' as bilgi;
