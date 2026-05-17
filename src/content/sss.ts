// /sss sayfası için kategorize edilmiş sıkça sorulan sorular.
// Reklam yasağı (Avukatlık Kanunu m.55, TBB Meslek Kuralları m.7-9) gözetilerek;
// objektif, mevzuata dayalı, sayısal ve nötr dilde hazırlanmıştır.
// Garanti, müvekkil sayısı, başarı oranı veya övgü içermez.

export type Faq = { question: string; answer: string };

export type FaqCategory = {
  slug: string;
  title: string;
  description: string;
  faqs: Faq[];
};

export const faqCategories: FaqCategory[] = [
  {
    slug: 'genel-hukuki-surec',
    title: 'Genel Hukuki Süreç',
    description: 'Avukatlık hizmetinin temel işleyişi, vekalet ve ücret konularındaki sık sorulan sorular.',
    faqs: [
      {
        question: 'Avukatlık vekalet ücreti nasıl belirlenir?',
        answer:
          'Avukatlık ücreti, her yıl Türkiye Barolar Birliği tarafından yayımlanan Avukatlık Asgari Ücret Tarifesi (AAÜT) ile belirlenen sınırların altında olmamak üzere, dava türü ve değerine göre serbestçe kararlaştırılır (Avukatlık Kanunu m.164). Anlaşma kural olarak yazılı yapılır; tarifenin altında kararlaştırılan ücret geçersiz sayılır ve tarife uygulanır.',
      },
      {
        question: 'Vekaletname nereden çıkarılır?',
        answer:
          'Avukata vekalet vermek için noter aracılığıyla "genel" veya "özel" vekaletname düzenlenmesi gerekir. Boşanma, soybağı, tanıma-tenfiz gibi bazı davalar için "özel yetkili" vekaletname zorunludur. Yurt dışında bulunanlar T.C. konsoloslukları üzerinden vekaletname düzenleyebilir.',
      },
      {
        question: 'Dava açmadan önce arabuluculuk zorunlu mudur?',
        answer:
          'Ticari davalarda (para alacağı/tazminat), iş hukuku uyuşmazlıklarında (kıdem, ihbar, işe iade), tüketici davalarında ve 01.09.2023 itibarıyla kira tespit, tahliye ile uyarlama davalarında dava şartı arabuluculuk uygulanır. Arabulucuya başvurmadan açılan dava, dava şartı yokluğundan reddedilir.',
      },
      {
        question: 'İstinaf ve temyiz süresi kaç gündür?',
        answer:
          'Hukuk davalarında istinaf süresi gerekçeli kararın tebliğinden itibaren 2 hafta (HMK m.345), Bölge Adliye Mahkemesi kararına karşı temyiz süresi 2 haftadır (HMK m.361). Ceza davalarında istinaf ve temyiz süresi gerekçeli kararın tebliğinden itibaren 2 haftadır (CMK m.273, m.291).',
      },
    ],
  },
  {
    slug: 'is-hukuku',
    title: 'İş Hukuku',
    description: 'Kıdem ve ihbar tazminatı, işe iade, fesih ve arabuluculuk hakkında sık sorulan sorular.',
    faqs: [
      {
        question: 'Kıdem tazminatına nasıl hak kazanılır?',
        answer:
          'İş Kanunu m.14 (1475 sk.) uyarınca kıdem tazminatı için işçinin en az 1 yıl çalışması ve sözleşmenin haklı veya kanunda öngörülen nedenlerle (işverenin haksız feshi, sağlık, askerlik, emeklilik, kadın işçinin evlilik feshi vb.) sona ermiş olması gerekir. İşçinin haklı neden olmadan istifası kıdem tazminatına hak kazandırmaz.',
      },
      {
        question: 'İhbar tazminatı ne zaman ödenir?',
        answer:
          'İş Kanunu m.17 uyarınca; belirsiz süreli iş sözleşmesinin haklı neden olmaksızın ve ihbar süresi (6 aya kadar 2 hafta, 6 ay-1,5 yıl 4 hafta, 1,5-3 yıl 6 hafta, 3 yıl+ 8 hafta) verilmeden feshedilmesi hâlinde, bildirim süresine ilişkin ücret ihbar tazminatı olarak ödenir.',
      },
      {
        question: 'İşe iade davası şartları nelerdir?',
        answer:
          'İş Kanunu m.18 uyarınca; işyerinde en az 30 işçi çalışması, işçinin en az 6 aylık kıdeminin bulunması, belirsiz süreli iş sözleşmesi ile çalışması ve feshin geçerli bir nedene dayanmaması gerekir. Fesih bildiriminin tebliğinden itibaren 1 ay içinde arabulucuya başvurulması dava şartıdır.',
      },
      {
        question: '2026 yılı kıdem tazminatı tavanı nedir?',
        answer:
          '2026/1. dönemi için kıdem tazminatı tavanı 64.948,77 TL olarak uygulanmaktadır. Tavan; Devlet Memurları Kanunu’na göre devlet memurlarına ödenen 1 yıllık emeklilik ikramiyesi tutarına bağlı olarak her 6 ayda bir güncellenir ve bu tutarın üzerinde kıdem tazminatı ödenemez.',
      },
    ],
  },
  {
    slug: 'aile-hukuku',
    title: 'Aile ve Boşanma Hukuku',
    description: 'Boşanma türleri, velayet, nafaka ve mal rejimi hakkında temel hukuki bilgiler.',
    faqs: [
      {
        question: 'Anlaşmalı boşanmanın şartları nelerdir?',
        answer:
          'Türk Medeni Kanunu m.166/3 uyarınca anlaşmalı boşanma için; eşlerin en az 1 yıldır evli olması, mahkemeye birlikte başvurmaları veya bir eşin açtığı davayı diğerinin kabul etmesi ve velayet, nafaka, mal paylaşımı ile tazminat dahil tüm sonuçlarda anlaşmaları gerekir. Hâkim protokolü uygun bulursa boşanmaya karar verir.',
      },
      {
        question: 'Velayet kime verilir?',
        answer:
          'Türk Medeni Kanunu m.182 uyarınca velayet, "çocuğun üstün yararı" ilkesine göre belirlenir. Çocuğun yaşı, sağlığı, eğitim ihtiyacı, anne-baba ile bağı, ebeveynlerin ekonomik ve sosyal durumu gibi pek çok unsur birlikte değerlendirilir. 0-3 yaş aralığındaki çocukların velayeti kural olarak anneye verilmektedir.',
      },
      {
        question: 'Nafaka türleri nelerdir?',
        answer:
          'Türk Medeni Kanunu’nda dört nafaka türü düzenlenmiştir: tedbir nafakası (dava sırasında, TMK m.169), yoksulluk nafakası (boşanma nedeniyle yoksulluğa düşecek eşe, TMK m.175), iştirak nafakası (velayet kendisinde olmayan eşin çocuk için ödediği, TMK m.182) ve yardım nafakası (yakın akraba arasında, TMK m.364).',
      },
      {
        question: 'Edinilmiş mallara katılma rejimi nedir?',
        answer:
          '01.01.2002 tarihinden sonra evlenenler için yasal mal rejimi, edinilmiş mallara katılmadır (TMK m.218). Bu rejimde, evlilik birliği içinde karşılığı verilerek edinilen mallar boşanma hâlinde eşler arasında yarı yarıya paylaşılır; miras, bağış, kişisel kullanım eşyası ve evlilik öncesi mallar "kişisel mal" olup paylaşıma girmez.',
      },
    ],
  },
  {
    slug: 'gayrimenkul-kira',
    title: 'Gayrimenkul ve Kira Hukuku',
    description: 'Kira artışı, tahliye, kira tespit ve tapu uyuşmazlıklarında sık sorulan sorular.',
    faqs: [
      {
        question: 'Konut kira artış oranı 2026 yılında nedir?',
        answer:
          'Türk Borçlar Kanunu m.344 uyarınca konut kiralarındaki yıllık artış oranı, bir önceki kira yılındaki tüketici fiyat endeksindeki on iki aylık ortalamaları geçemez. 2024 Temmuz’da sona eren %25 sınırı sonrası, artış kira sözleşmesi tarafları arasında TÜFE 12 aylık ortalama oranını aşmamak kaydıyla serbestçe belirlenir.',
      },
      {
        question: 'Tahliye taahhütnamesi geçerlilik şartları nelerdir?',
        answer:
          'TBK m.352/1 uyarınca tahliye taahhütnamesinin geçerli olabilmesi için; kira sözleşmesinin yapılmasından sonraki bir tarihte yazılı olarak düzenlenmesi, tahliye edilecek tarihin belirli olması ve kiracının bizzat ya da yetkili temsilcisi tarafından imzalanmış olması gerekir. Aksi hâlde tahliye davası reddedilir.',
      },
      {
        question: 'Kira tespit davası ne zaman açılabilir?',
        answer:
          'TBK m.345 uyarınca kira tespit davası, her zaman açılabilir; ancak yeni kira döneminin başlangıcından en geç 30 gün önceki bir tarihte açılır veya kiraya veren tarafından bu süre içinde kira artırılacağına ilişkin yazılı bildirim yapılırsa, ileriki dönemden itibaren uygulanmak üzere açılabilir. 5 yıllık kira ilişkisinden sonra rayiç bedele göre tespit istenebilir.',
      },
      {
        question: 'Kira uyuşmazlıklarında arabuluculuk zorunlu mudur?',
        answer:
          '01.09.2023 tarihinden itibaren; kira bedelinin tespiti, tahliye ve uyarlama davalarında dava şartı arabuluculuk uygulanmaktadır (HMK ek m.20). Arabuluculuk son tutanağı eklenmeden açılan dava, dava şartı yokluğundan reddedilir.',
      },
    ],
  },
  {
    slug: 'ceza-hukuku',
    title: 'Ceza Hukuku',
    description: 'Şikayet, ifade verme, tutuklama ve istinaf süreçlerinde sık sorulan sorular.',
    faqs: [
      {
        question: 'Şikayete bağlı suçlarda şikayet süresi nedir?',
        answer:
          'Türk Ceza Kanunu m.73 uyarınca; şikayete bağlı suçlarda mağdur, fiili ve faili öğrendiği tarihten itibaren 6 ay içinde şikayet hakkını kullanmak zorundadır. Bu süre hak düşürücüdür ve geçtikten sonra kovuşturma yapılamaz. Hakaret, tehdit, basit yaralama gibi suçlar şikayete bağlıdır.',
      },
      {
        question: 'İfade verirken avukat bulunması zorunlu mudur?',
        answer:
          'Ceza Muhakemesi Kanunu m.150 uyarınca; şüpheli veya sanık çocuksa, kendini savunamayacak derecede malul ise ya da sağır ve dilsiz ise istemine bakılmaksızın müdafi görevlendirilir. Alt sınırı 5 yıldan fazla hapis cezasını gerektiren suçlarda da müdafi zorunludur. Diğer hâllerde şüpheli/sanık istemde bulunursa avukat görevlendirilir.',
      },
      {
        question: 'Tutuklama kararına nasıl itiraz edilir?',
        answer:
          'CMK m.101 uyarınca tutuklama kararına karşı şüpheli, sanık, müdafi veya yasal temsilci tarafından kararın verildiği tarihten itibaren 7 gün içinde itiraz edilebilir. İtiraz; soruşturma evresinde Sulh Ceza Hakimliğinin bağlı bulunduğu Asliye Ceza Mahkemesine, kovuşturma evresinde ise bir üst mercie yapılır.',
      },
      {
        question: 'Hükmün açıklanmasının geri bırakılması (HAGB) şartları nelerdir?',
        answer:
          'CMK m.231 uyarınca HAGB için; sanığa verilen hapis cezasının 2 yıl veya daha az süreli olması, sanığın daha önce kasıtlı bir suçtan mahkum olmaması, mağdurun zararının giderilmiş olması ve sanığın bir daha suç işlemeyeceğine kanaat getirilmesi gerekir. Sanığın 5 yıl içinde kasıtlı yeni bir suç işlememesi hâlinde dava düşer.',
      },
    ],
  },
  {
    slug: 'icra-borc',
    title: 'İcra ve Borç Takibi',
    description: 'İlamsız icra, itiraz, haciz ve emekli maaşı haczi konularında sık sorulan sorular.',
    faqs: [
      {
        question: 'İlamsız icra takibine itiraz süresi nedir?',
        answer:
          'İcra ve İflas Kanunu m.62 uyarınca, ilamsız icra takibinde borçlunun ödeme emrinin tebliğinden itibaren 7 gün içinde icra dairesine itirazda bulunması gerekir. Süresinde yapılan itiraz takibi durdurur. İtirazsız geçen takip kesinleşir ve haciz aşamasına geçilir.',
      },
      {
        question: 'Emekli maaşı haczedilebilir mi?',
        answer:
          '5510 sayılı Sosyal Sigortalar ve GSS Kanunu m.93 uyarınca emekli maaşları kural olarak haczedilemez. İstisnaları; nafaka borçları, Kurum’un yersiz ödediği aylıkları geri istemesi ve borçlunun kendi muvafakatiyle yapılan kesintilerdir.',
      },
      {
        question: 'Karşılıksız çekte banka sorumluluğu ne kadardır?',
        answer:
          '5941 sayılı Çek Kanunu uyarınca, çekin karşılığının bankada bulunmaması hâlinde muhatap banka, her bir çek için 2025 yılı tutarı 12.650 TL’ye kadar ödeme yapmak zorundadır. Bu tutar üzeri için lehtarın icra takibi veya çek tazminatı davası yoluna gitmesi gerekir.',
      },
      {
        question: 'Lüzumlu ev eşyası haczedilebilir mi?',
        answer:
          'İcra ve İflas Kanunu m.82 uyarınca borçlu ve aynı çatı altında yaşayan aile bireylerinin yaşamı için gerekli olan ve aynı amaca hizmet eden eşyaların biri (örneğin tek televizyon, tek buzdolabı, tek çamaşır makinesi, yatak vb.) haczedilemez.',
      },
    ],
  },
  {
    slug: 'trafik-cezasi',
    title: 'Trafik Cezaları ve İdari Yaptırımlar',
    description: 'Radar cezaları, ehliyet geri alma ve idari para cezasına itiraz hakkında sık sorulan sorular.',
    faqs: [
      {
        question: 'Radar cezasına nasıl itiraz edilir?',
        answer:
          'Kabahatler Kanunu m.27 uyarınca; trafik idari para cezasının tebliğinden itibaren 15 gün içinde Sulh Ceza Hakimliğine itiraz edilebilir. Başvuruda; ölçüm cihazının kalibrasyon belgesi, hız sınırı levhasının görünürlüğü, tutanağın usule uygunluğu gibi şekil ve esas yönünden incelenebilecek hususlar ileri sürülebilir.',
      },
      {
        question: 'İdari para cezasında erken ödeme indirimi var mı?',
        answer:
          'Kabahatler Kanunu m.17/6 uyarınca; idari para cezasının tebliğinden itibaren 15 gün içinde ödenmesi hâlinde dörtte bir oranında peşin ödeme indirimi uygulanır. İndirimli ödeme, cezaya karşı dava açma hakkını ortadan kaldırmaz.',
      },
      {
        question: 'Hız ihlalinde ehliyete el koyma hangi durumda yapılır?',
        answer:
          '2918 sayılı KTK m.51 uyarınca; yerleşim yeri içinde hız sınırını 46-55 km/s aşan sürücülerin ehliyeti 30 gün, 56-65 km/s aşanların 60 gün, 66 km/s ve daha fazla aşanların 90 gün süreyle geri alınır. Yerleşim yeri dışında ise eşik 51 km/s’den başlar ve aynı süreler uygulanır.',
      },
      {
        question: 'İdare mahkemesinde dava açma süresi nedir?',
        answer:
          'İYUK m.7 uyarınca; idare mahkemelerinde dava açma süresi tebliği izleyen günden başlamak üzere 60 gündür. Vergi mahkemelerinde bu süre 30 gündür. Sürenin son günü tatil gününe rastlarsa süre tatili izleyen ilk iş günü sonuna kadar uzar.',
      },
    ],
  },
];

export function getAllFaqsFlat() {
  return faqCategories.flatMap((c) => c.faqs);
}
