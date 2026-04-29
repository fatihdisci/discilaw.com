// Çalışma alanı sayfaları için "Hızlı Cevap" içerikleri.
// Reklam yasağı (Av. K. m.55, TBB Meslek Kuralları) gözetilerek;
// objektif, mevzuata dayalı, sayısal ve nötr dilde hazırlanmıştır.

export type QuickAnswer = {
  intro: string;
  highlights: string[];
};

export const quickAnswers: Record<string, QuickAnswer> = {
  'aile-ve-bosanma': {
    intro:
      'Aile hukuku; evlilik, boşanma, velayet, nafaka ve mal rejimi ilişkilerini Türk Medeni Kanunu çerçevesinde düzenler. Boşanma davaları anlaşmalı ve çekişmeli olmak üzere ikiye ayrılır; anlaşmalı boşanma için tarafların en az bir yıl evli olması ve protokolde tüm sonuçlar üzerinde mutabakat zorunludur.',
    highlights: [
      '<strong>Anlaşmalı boşanma şartı:</strong> En az 1 yıllık evlilik + protokol',
      '<strong>Çekişmeli boşanma süresi:</strong> Ortalama 1–3 yıl',
      '<strong>Soybağının reddi:</strong> Öğrenmeden itibaren 1 yıl içinde',
      '<strong>Velayette esas ölçüt:</strong> Çocuğun üstün yararı (TMK m.182)',
    ],
  },

  'bilisim-hukuku': {
    intro:
      'Bilişim hukuku; KVKK uyumu, internet içeriklerine erişim engeli, sosyal medya yoluyla işlenen suçlar ve e-ticaret ilişkilerinden doğan uyuşmazlıkları kapsar. 5651 sayılı Kanun kapsamında kişilik hakkı ihlali içeren içerikler için Sulh Ceza Hakimliğine doğrudan başvuru yapılabilir; sosyal ağ sağlayıcılarının başvurulara 48 saat içinde yanıt verme yükümlülüğü bulunur.',
    highlights: [
      '<strong>Sosyal ağ sağlayıcı yanıt süresi:</strong> 48 saat (5651 sk.)',
      '<strong>Bilişim sistemine girme cezası:</strong> 1 yıla kadar hapis (TCK 243)',
      '<strong>Kişisel veriyi yayma cezası:</strong> 2–4 yıl hapis (TCK 136)',
      '<strong>Şantaj cezası:</strong> 1–3 yıl hapis (TCK 107)',
    ],
  },

  'ceza-hukuku': {
    intro:
      'Ceza hukuku; soruşturma, kovuşturma ve infaz aşamalarında bireyin haklarını ve özgürlüğünü doğrudan etkiler. Türk Ceza Kanunu ve Ceza Muhakemesi Kanunu kapsamında ifade alma, tutuklama incelemesi, savunma hazırlığı ve kanun yolları (istinaf-temyiz) süreçleri yürütülür. İstinaf ve temyiz süresi, gerekçeli kararın tebliğinden itibaren 2 haftadır.',
    highlights: [
      '<strong>İstinaf/temyiz süresi:</strong> Tebliğden itibaren 2 hafta',
      '<strong>Adli para cezası günlüğü:</strong> 100–500 TL',
      '<strong>Genel suçlarda koşullu salıverme:</strong> 1/2 oran',
      '<strong>11. Yargı Paketi şartı:</strong> Suç tarihi 31.07.2023 ve öncesi',
    ],
  },

  'gayrimenkul-hukuku': {
    intro:
      'Gayrimenkul hukuku; tapu iptali ve tescil, kira ilişkileri, tahliye, kat mülkiyeti ve kamulaştırma uyuşmazlıklarını kapsar. 1 Eylül 2023’ten itibaren kira tespit, tahliye ve uyarlama davalarında dava açmadan önce arabulucuya başvuru zorunludur. 5 yılını dolduran kiracılar için %25/TÜFE sınırı uygulanmaz; kira hâkim tarafından emsal rayiçlere göre belirlenir.',
    highlights: [
      '<strong>Kira uyuşmazlıklarında arabuluculuk:</strong> Zorunlu (01.09.2023 itibarıyla)',
      '<strong>Kira tespit davası şartı:</strong> Sözleşmeden 5 yıl geçmiş olmalı',
      '<strong>Tahliye taahhütnamesi:</strong> Kira sözleşmesinden sonraki tarihli, yazılı',
      '<strong>10 yıllık uzama süresi:</strong> Kiraya verene fesih hakkı doğurur',
    ],
  },

  'icra-hukuku': {
    intro:
      'İcra hukuku; alacakların devlet zoruyla tahsilini, haciz ve iflas süreçlerini İcra ve İflas Kanunu çerçevesinde düzenler. İlamsız icra takibinde borçlunun ödeme emrine itiraz süresi 7 gündür; itiraz takibi durdurur. Emekli maaşları kural olarak haczedilemez; nafaka ve SGK prim borçları bu kuralın istisnasıdır.',
    highlights: [
      '<strong>İlamsız takipte itiraz süresi:</strong> 7 gün',
      '<strong>Emekli maaşı haczi:</strong> Kural olarak yapılamaz (istisna: nafaka, SGK)',
      '<strong>Karşılıksız çekte banka sorumluluğu:</strong> 12.650 TL (2025)',
      '<strong>Lüzumlu ev eşyası:</strong> Haczedilemez (İİK m.82)',
    ],
  },

  'idare-hukuku': {
    intro:
      'İdare hukuku; bireyin idari işlem ve eylemler karşısındaki haklarını, iptal ve tam yargı davalarını, idari para cezalarına itiraz süreçlerini düzenler. İdare ve Danıştay’da genel dava açma süresi 60 gün, vergi mahkemelerinde 30 gündür. İdarenin 30 gün içinde yanıt vermemesi zımni ret sayılır.',
    highlights: [
      '<strong>İdare mahkemesi dava süresi:</strong> 60 gün (vergi: 30 gün)',
      '<strong>Zımni ret süresi:</strong> 30 gün (idarenin sessiz kalması)',
      '<strong>2026 istinaf sınırı (idari yargı):</strong> 55.000 TL',
      '<strong>Yürütmeyi durdurma şartı:</strong> Telafisi güç zarar + açık hukuka aykırılık',
    ],
  },

  'is-hukuku': {
    intro:
      'İş hukuku; işçi-işveren ilişkilerini, iş güvencesi hükümlerini, kıdem-ihbar tazminatlarını ve toplu iş sözleşmelerini İş Kanunu kapsamında düzenler. İşe iade davası açabilmek için işyerinde en az 30 işçi çalışması, işçinin 6 aylık kıdemi ve belirsiz süreli sözleşme şarttır. Fesih bildiriminin tebliğinden itibaren 1 ay içinde arabulucuya başvurmak dava şartıdır.',
    highlights: [
      '<strong>Kıdem tavanı (2026/1):</strong> 64.948,77 TL',
      '<strong>İşe iade için minimum kıdem:</strong> 6 ay',
      '<strong>İşe iade arabuluculuk süresi:</strong> Fesihten itibaren 1 ay',
      '<strong>2026 istinaf sınırı (iş yargısı):</strong> 50.000 TL',
    ],
  },

  'sirket-danismanligi': {
    intro:
      'Şirket danışmanlığı; kuruluş, esas sözleşme, genel kurul, birleşme-devralma ve kurumsal yönetişim süreçlerini Türk Ticaret Kanunu çerçevesinde kapsar. 2024’ten itibaren anonim şirketler için asgari sermaye 250.000 TL, limited şirketler için 50.000 TL’dir. Asgari sermayenin altındaki şirketlere 31.12.2026’ya kadar yükseltme zorunluluğu bulunur.',
    highlights: [
      '<strong>Anonim şirket asgari sermayesi:</strong> 250.000 TL',
      '<strong>Limited şirket asgari sermayesi:</strong> 50.000 TL',
      '<strong>Sermaye artırma son tarihi:</strong> 31.12.2026',
      '<strong>Sözleşmeli avukat zorunluluğu:</strong> Sermayesi 1.250.000 TL+ AŞ',
    ],
  },

  'ticaret-hukuku': {
    intro:
      'Ticaret hukuku; ticari işletme, şirketler, kıymetli evrak ve ticari sözleşmelerden kaynaklanan uyuşmazlıkları Türk Ticaret Kanunu çerçevesinde düzenler. Konusu para alacağı veya tazminat olan ticari davalarda dava açmadan önce arabulucuya başvuru dava şartıdır. Tüketici Hakem Heyetlerine başvuru sınırı 2026 yılı itibarıyla 186.000 TL’dir.',
    highlights: [
      '<strong>Ticari uyuşmazlıkta arabuluculuk:</strong> Para alacağı/tazminat için zorunlu',
      '<strong>Tüketici Hakem Heyeti sınırı (2026):</strong> 186.000 TL',
      '<strong>Karşılıksız çek (banka sorumluluğu):</strong> 12.650 TL',
      '<strong>Haksız rekabet davaları:</strong> Tespit, men, eski hâle iade, tazminat',
    ],
  },
};
